var debugTextArea = document.getElementById("debugTextArea");
function debug(message) {
    debugTextArea.value += message + "\n";
    debugTextArea.scrollTop = debugTextArea.scrollHeight;
}

function sendCmd(cmd, value){
    if ( websocket != null )
    {
        msg = cmd + ':' + parseInt(value)
        sendMessageArg(msg);
    }
}

function sendColor(){
    var color = document.getElementById("colorpicker").value;
    msg = 'Ellen.Farve:' + parseInt('0x' + color.substring(1))
    sendMessageArg(msg);
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
