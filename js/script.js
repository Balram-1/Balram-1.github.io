console.log("javascript connected");
const clockElement=document.querySelector(".taskbar-clock");

function updateClock(){
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm ;
    //convert to 12 h format
    if(hours >= 12){
        ampm='PM';
    } else{
        ampm='AM';
    }

    //convert 24h to 12h format
    hours= hours % 12;
    if(hours === 0){
        hours = 12;
    }
    if(minutes < 10){
        minutes='0' + minutes;
    }

    //final string
    const timeString =  hours+":"+minutes+" "+ampm;

    //logging
    clockElement.textContent=timeString;


}

setInterval(updateClock,1000);