var wsUri = "ws://" + window.location.host + "/ws";
var websocket = null;
function initWebSocket() {
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
        websocket.onmessage = function (evt) {
            console.log( "Message received :", evt.data );
            debug( evt.data );
        };
        websocket.onerror = function (evt) {
            debug('ERROR: ' + evt.data);
        };
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
        console.log( "Command is to long: ", '"' + msg + '"' );
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

function OnCommandReceive(name, value)
{

}

function sendColor(){
    var color = document.getElementById("colorpicker").value;
    sendCmd('E.F', parseInt('0x' + color.substring(1)))
}

function sendMessageArg(msg){
    if ( websocket != null )
    {
        websocket.send( msg );
        console.log( "string sent :", '"'+msg+'"' );
    }
}

function sendCommand(){
    var cmd = document.getElementById("inputCmd").value;
    var value = document.getElementById("inputValue").value;
    sendCmd(cmd, value)
}

function sendMessage() {
    var msg = document.getElementById("inputText").value;
    if ( websocket != null )
    {
        document.getElementById("inputText").value = "";
        sendMessageArg(msg)
    }
}

function stopWebSocket() {
    if (websocket)
        websocket.close();
}

function checkSocket() {
    if (websocket != null) {
        var stateStr;
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
        debug("WebSocket is null");
    }
}

var debugTextArea = document.getElementById("debugTextArea");
function debug(message) {
    debugTextArea.value += message + "\n";
    debugTextArea.scrollTop = debugTextArea.scrollHeight;
}
