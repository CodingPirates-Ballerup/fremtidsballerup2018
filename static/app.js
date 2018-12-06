var windPower = {
    0 : 0,
    1 : 1,
    2 : 2,
    3 : 3,
    4 : 4,
    5 : 5,
    6 : 6,
    7 : 7
};

windLevel = 0;

$('.btn').on('click', function(){
    
    let buttonValue =  $(this).attr("data-cmd");
    sendMessageArg(buttonValue);
    
});

$('.wind').on('click', function(){
    let buttonValue =  $(this).attr("data-cmd");
    windPower = buttonValue;
});

$("#serverOn").on('click', function(){
    console.log("serveron");
    initWebSocket(CommandRecieved);
});

function CommandRecieved(name, value)
{ 
    console.log("CommandRecieved", name, value);
}

// setInterval(function(){ 
//     var randomNumer = Math.floor(Math.random() * 10)
//     windLevel = windPower[randomNumer]

//     switch (true) {
//         case (windLevel > 0 && windLevel < 5):
//             console.log("let vind")
//             break;
//         case (windLevel >= 5):
//             console.log("hård vind")
//             break;
//         default:
//             console.log("det blæser ikke");
//     }
// }, 1000);
