console.log("javascript connected");

// CLOCK
const clockElement = document.querySelector(".taskbar-clock");

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    clockElement.textContent = hours + ":" + minutes + " " + ampm;
}

updateClock(); // immediate update
setInterval(updateClock, 1000);

// ICONS
const icons = document.querySelectorAll(".icon");

for (const icon of icons) {
    icon.addEventListener("click", handleIconClick);
    icon.addEventListener("dblclick", handleIconDblClick);
}

function handleIconClick(event) {
    const clickedIcon = event.currentTarget;
    for (const icon of icons) icon.classList.remove("selected");
    clickedIcon.classList.add("selected");

    const label = clickedIcon.querySelector("span").textContent.trim();
    console.log(label + " clicked");
}

// WINDOWS
const myComputerWindow = document.querySelector("#mycomputer-window");

function handleIconDblClick(event) {
    const dblClickedIcon = event.currentTarget;
    const label = dblClickedIcon.querySelector("span").textContent.trim();
    console.log(label + " opened");

    if (label === "My Computer") {
        myComputerWindow.classList.add("open");
        // Create taskbar button if not already present
        if (!myComputerTaskbarButton) {
            myComputerTaskbarButton = createTaskbarButton("My Computer");
        }
    }
}

// CONTROLS
const closeButton = myComputerWindow.querySelector(".close");
closeButton.addEventListener("click", () => {
    myComputerWindow.classList.remove("open", "maximized", "minimized");
    console.log("My Computer closed");

    if (myComputerTaskbarButton) {
        myComputerTaskbarButton.remove();
        myComputerTaskbarButton = null;
    }
});

const maximizeButton = myComputerWindow.querySelector(".maximize");
maximizeButton.addEventListener("click", () => {
    myComputerWindow.classList.toggle("maximized");
    if (myComputerWindow.classList.contains("maximized")) {
        console.log("My Computer maximized");
    } else {
        console.log("My Computer restored");
    }
});

const minimizeButton = myComputerWindow.querySelector(".minimize");
const taskbarApps = document.querySelector(".taskbar-apps");

function createTaskbarButton(label) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.classList.add("taskbar-button");

    // Restore window when clicked
    btn.addEventListener("click", () => {
        myComputerWindow.classList.remove("minimized");
        myComputerWindow.classList.add("open");
        console.log(label + " restored from taskbar");
    });

    taskbarApps.appendChild(btn);
    return btn;
}

let myComputerTaskbarButton = null;

minimizeButton.addEventListener("click", () => {
    myComputerWindow.classList.add("minimized");
    console.log("My Computer minimized");

    if (!myComputerTaskbarButton) {
        myComputerTaskbarButton = createTaskbarButton("My Computer");
    }
});
