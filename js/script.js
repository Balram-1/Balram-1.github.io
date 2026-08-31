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

const icons=document.querySelectorAll(".icon");
console.log(icons);
console.log(icons.length);

for(const icon of icons ){
    icon.addEventListener("click",handleIconClick);

}
function handleIconClick(event) {
    const clickedIcon = event.currentTarget;

    // Step 1: remove "selected" from ALL icons
    for (const icon of icons) {
        icon.classList.remove("selected");
    }

    // Step 2: add "selected" to the clicked one
    clickedIcon.classList.add("selected");

    // Step 3: log which one was clicked
    const label = clickedIcon.querySelector("span").textContent;
    console.log(label + " clicked");
}

console.log("here u go ");
console.log(icon.classList);