var useDebugWindow = false;
var wsUri = "ws://" + window.location.host + "/ws";
var websocket = null;
var cmdRcvCallback = function(cmd, value){}
function initWebSocket(cmdCallback) {
    try {
        if (typeof MozWebSocket == 'function')
            WebSocket = MozWebSocket;
        if ( websocket && websocket.readyState == 1 )
            websocket.close();
        websocket = new WebSocket( wsUri );
        websocket.onopen = function (evt) {
            debug("CONNECTED");
        };
        websocket.onclose = function (evt) {
            debug("DISCONNECTED");
        };
        websocket.onmessage = OnMsgReceive;
        websocket.onerror = function (evt) {
            debug('ERROR: ' + evt.data);
        };
        // Register the command callback function.
        if (typeof cmdCallback === "function") {
            cmdRcvCallback = cmdCallback;
        }
    } catch (exception) {
        debug('ERROR: ' + exception);
    }
}

function sendCmd(cmd, value)
{
    var intValue = parseInt(value)
    // check that value can be converted to an integer.
    if(Number.isNaN(intValue))
    {
        console.log( "Command value is not an integer: ", '"' + value + '"' );
        return;
    }
    msg = cmd + ':' + parseInt(value)
    // check for maximum string length (18 bytes, limited by the micro:bit)
    if(msg.length > 17 ) // 17 + termination (\n))
    {
        console.log( "Command is to long: ", '"' + msg + '"' );
        return;
    }
    sendMessageArg(msg);
}

function OnMsgReceive(evt)
{
    debug( evt.data );
    var msg = String(evt.data);
    var pos = msg.indexOf(":");
    if(pos < 0) 
    {
        console.log( "Message received :", evt.data );
        return;
    }
    var name = msg.substring(0,pos);
    var value = msg.substring(pos+1);
    var intValue = parseInt(value)
    if(Number.isNaN(intValue))
    {
        console.log( "Invalid command recieved: ", '"' + msg + '"' );
        return;
    }
    cmdRcvCallback(name, intValue);
}

function sendColor(){
    var color = document.getElementById("colorpicker").value;
    sendCmd('E.F', parseInt('0x' + color.substring(1)))
}

function sendMessageArg(msg)
{
    if ( websocket != null )
    {
        websocket.send( msg );
        console.log( "string sent :", '"'+msg+'"' );
    }
}

function sendCommand()
{
    var cmd = document.getElementById("inputCmd").value;
    var value = document.getElementById("inputValue").value;
    sendCmd(cmd, value)
}

function sendMessage() 
{
    var msg = document.getElementById("inputText").value;
    if ( websocket != null )
    {
        document.getElementById("inputText").value = "";
        sendMessageArg(msg)
    }
}

function stopWebSocket()
{
    if (websocket)
        websocket.close();
}

function checkSocket()
{
    var stateStr;
    if (websocket != null) {
        switch (websocket.readyState) {
            case 0: {
                stateStr = "CONNECTING";
                break;
            }
            case 1: {
                stateStr = "OPEN";
                break;
            }
            case 2: {
                stateStr = "CLOSING";
                break;
            }
            case 3: {
                stateStr = "CLOSED";
                break;
            }
            default: {
                stateStr = "UNKNOW";
                break;
            }
        }
        debug("WebSocket state = " + websocket.readyState + " ( " + stateStr + " )");
    } else {
        stateStr = "NOT INITIALIZED";
        debug("WebSocket is null");
    }
    return stateStr;
}

function debug(message)
{
    if(!useDebugWindow)
    {
        return;
    }
    var debugTextArea = document.getElementById("debugTextArea");
    debugTextArea.value += message + "\n";
    debugTextArea.scrollTop = debugTextArea.scrollHeight;
}
