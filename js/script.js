console.log("javascript connected");


// ============================================================
// GLOBAL WINDOW Z-INDEX
// ============================================================

let topZIndex = 10;

function bringWindowToFront(windowElement) {
    topZIndex++;
    windowElement.style.zIndex = topZIndex;
}


// ============================================================
// CLOCK
// ============================================================

const clockElement = document.querySelector(".taskbar-clock");

function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    let ampm = hours >= 12 ? "PM" : "AM";

    // Convert 24-hour format to 12-hour format
    hours = hours % 12 || 12;

    // Add leading zero to minutes
    minutes = minutes < 10 ? "0" + minutes : minutes;

    const timeString = hours + ":" + minutes + " " + ampm;

    clockElement.textContent = timeString;
}

updateClock();
setInterval(updateClock, 1000);


// ============================================================
// DESKTOP ICONS
// ============================================================

const icons = document.querySelectorAll(".icon");

for (const icon of icons) {
    icon.addEventListener("click", handleIconClick);
    icon.addEventListener("dblclick", handleIconDblClick);
}


function handleIconClick(event) {
    const clickedIcon = event.currentTarget;

    // Remove selection from all icons
    for (const icon of icons) {
        icon.classList.remove("selected");
    }

    // Select clicked icon
    clickedIcon.classList.add("selected");

    const label = clickedIcon.querySelector("span").textContent.trim();

    console.log(label + " clicked");
}


// ============================================================
// TASKBAR
// ============================================================

const taskbarApps = document.querySelector(".taskbar-apps");


function createTaskbarButton(label, windowElement) {

    const btn = document.createElement("button");

    btn.textContent = label;
    btn.classList.add("taskbar-button");


    // Restore window when taskbar button is clicked
    btn.addEventListener("click", () => {

        windowElement.classList.remove("minimized");
        windowElement.classList.add("open");

        bringWindowToFront(windowElement);

        console.log(label + " restored from taskbar");
    });


    taskbarApps.appendChild(btn);

    return btn;
}


// ============================================================
// DOUBLE-CLICK → OPEN WINDOW
// ============================================================

function handleIconDblClick(event) {

    const dblClickedIcon = event.currentTarget;

    const label =
        dblClickedIcon.querySelector("span").textContent.trim();

    const app = dblClickedIcon.dataset.app;

    console.log(label + " opened");
    console.log("Application: " + app);


    // Build the window selector dynamically
    //
    // Example:
    // app = "mycomputer"
    // becomes "#mycomputer-window"

    const windowSelector = `#${app}-window`;

    const windowElement =
        document.querySelector(windowSelector);


    // Check whether the corresponding window exists
    if (windowElement) {

        // Remove minimized state
        windowElement.classList.remove("minimized");

        // Make sure window is open
        windowElement.classList.add("open");

        // Bring it to the front
        bringWindowToFront(windowElement);


        // Create taskbar button if one doesn't exist
        if (!windowElement.taskbarButton) {

            windowElement.taskbarButton =
                createTaskbarButton(label, windowElement);
        }

    } else {

        console.warn(
            "No window found for app:",
            app
        );
    }
}


// ============================================================
// GENERIC CLOSE HANDLER
// ============================================================

function attachCloseHandler(windowElement) {

    const closeButton =
        windowElement.querySelector(".close");


    closeButton.addEventListener("click", (event) => {
        event.stopPropagation();

        // Remove every window state
        windowElement.classList.remove(
            "open",
            "maximized",
            "minimized"
        );

        console.log(
            windowElement.id + " closed"
        );


        // Remove taskbar button if it exists
        if (windowElement.taskbarButton) {

            windowElement.taskbarButton.remove();

            windowElement.taskbarButton = null;
        }
    });
}


// ============================================================
// GENERIC MAXIMIZE HANDLER
// ============================================================

function attachMaximizeHandler(windowElement) {
    const maximizeButton = windowElement.querySelector(".maximize");

    maximizeButton.addEventListener("click", (event) => {
        event.stopPropagation(); // stop bubbling
        toggleMaximize(windowElement);
    });
}


// ============================================================
// GENERIC MINIMIZE HANDLER
// ============================================================

function attachMinimizeHandler(windowElement, label) {

    const minimizeButton =
        windowElement.querySelector(".minimize");


    minimizeButton.addEventListener("click", (event) => {
        event.stopPropagation();

        windowElement.classList.add("minimized");

        console.log(label + " minimized");


        // Create taskbar button only once
        if (!windowElement.taskbarButton) {

            windowElement.taskbarButton =
                createTaskbarButton(
                    label,
                    windowElement
                );
        }
    });
}


// ============================================================
// GENERIC FOCUS HANDLER
// ============================================================

function attachFocusHandler(windowElement) {

    windowElement.addEventListener("mousedown", () => {

        bringWindowToFront(windowElement);

    });
}







function attachDragHandler(windowElement) {
    const titlebar = windowElement.querySelector(".titlebar");

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titlebar.addEventListener("mousedown", (event) => {
        if (windowElement.classList.contains("maximized")) {
            return; // don’t drag maximized windows
        }

        isDragging = true;
        offsetX = event.clientX - windowElement.offsetLeft;
        offsetY = event.clientY - windowElement.offsetTop;

        bringWindowToFront(windowElement);
    });

    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;

        let newLeft = event.clientX - offsetX;
        let newTop = event.clientY - offsetY;

        const maxLeft = window.innerWidth - windowElement.offsetWidth;
        const taskbarHeight = 50;
        const maxTop = window.innerHeight - windowElement.offsetHeight - taskbarHeight;

        newLeft = Math.min(maxLeft, Math.max(0, newLeft));
        newTop = Math.min(maxTop, Math.max(0, newTop));

        windowElement.style.left = newLeft + "px";
        windowElement.style.top = newTop + "px";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}


function attachTitlebarDoubleClickHandler(windowElement) {
    const titlebar = windowElement.querySelector(".titlebar");

    titlebar.addEventListener("dblclick", () => {
        toggleMaximize(windowElement);
    });
}



// ============================================================
// GENERIC WINDOW INITIALIZATION
// ============================================================

function initializeWindow(windowElement, label) {

    // Close button
    attachCloseHandler(windowElement);

    // Maximize button
    attachMaximizeHandler(windowElement);

    // Minimize button
    attachMinimizeHandler(windowElement, label);

    // Bring window to front when clicked
    attachFocusHandler(windowElement);

    // Make window draggable
    attachDragHandler(windowElement);

    // Double-click titlebar to maximize/restore
    attachTitlebarDoubleClickHandler(windowElement);
}





function toggleMaximize(windowElement) {
    if (!windowElement.classList.contains("maximized")) {
        // Save current position before maximizing
        windowElement.previousLeft = windowElement.offsetLeft;
        windowElement.previousTop = windowElement.offsetTop;

        windowElement.classList.add("maximized");
        console.log(windowElement.id + " maximized");
    } else {
        // Restore to previous position
        windowElement.classList.remove("maximized");

        windowElement.style.left = windowElement.previousLeft + "px";
        windowElement.style.top = windowElement.previousTop + "px";

        console.log(windowElement.id + " restored");
    }

    bringWindowToFront(windowElement);
}




// ============================================================
// INITIALIZE WINDOWS
// ============================================================

// My Computer
const myComputerWindow =
    document.querySelector("#mycomputer-window");

initializeWindow(
    myComputerWindow,
    "My Computer"
);


// Network
const networkWindow =
    document.querySelector("#network-window");

initializeWindow(
    networkWindow,
    "Network"
);

// Projects
const projectsWindow =
    document.querySelector("#projects-window");

initializeWindow(
    projectsWindow,
    "My Projects"
);

// Command Prompt
const cmdWindow =
    document.querySelector("#cmd-window");
initializeWindow(cmdWindow, "Command Prompt");

//Guestbook
const guestbookWindow =
    document.querySelector("#guestbook-window");

initializeWindow(
    guestbookWindow,
    "Guestbook"
);



// ============================================================
// PROJECT TABS
// ============================================================

const projectTabs =
    document.querySelectorAll(".project-tab");

const projects =
    document.querySelectorAll(".project");

for (const tab of projectTabs) {

    tab.addEventListener("click", () => {

        const projectId = tab.dataset.project;

        console.log("Opening project:", projectId);

        // Remove active from every tab
        for (const t of projectTabs) {
            t.classList.remove("active");
        }

        // Remove active from every project
        for (const p of projects) {
            p.classList.remove("active");
        }

        // Activate clicked tab
        tab.classList.add("active");

        // Find matching project
        const selectedProject = document.querySelector("#" + projectId);

        // Show selected project
        if (selectedProject) {
            selectedProject.classList.add("active");
        }

    });

}

// ============================================================
// TERMINAL
// ============================================================

const terminalInput = document.querySelector(".terminal-input");
const terminalOutput = document.querySelector(".terminal-output");

// Utility: print a line to the terminal
function printTerminal(text) {
    const line = document.createElement("p");
    line.textContent = text;
    terminalOutput.appendChild(line);
    // keep scroll at bottom
    terminalOutput.parentElement.classList.add("scrolled-to-bottom");
    terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
}

// Command handlers
function handleHelp() {
    printTerminal("Available commands:");
    printTerminal("  about");
    printTerminal("  projects");
    printTerminal("  skills");
    printTerminal("  contact");
    printTerminal("  clear");
}

function handleAbout() {
    printTerminal("Balrampreet Singh — Cybersecurity student focused on offensive security, network defense and CTFs.");
}

function handleProjects() {
    printTerminal("Projects:");
    printTerminal("  StegoForge  - steganography analysis tool  - GitHub: https://github.com/Balram-1/stegolab");
    printTerminal("  E-commerce  - AETHER storefront UI         - GitHub: https://github.com/Balram-1/E-commerce");
    printTerminal("  PPTX-MERGER - Merge PowerPoint files       - GitHub: https://github.com/Balram-1/PPTX-MERGER");
}

function handleSkills() {
    printTerminal("Skills: Python • Java • Bash • HTML • CSS • JavaScript • Web Security");
}

function handleContact() {
    printTerminal("Contact:");
    printTerminal("  GitHub: https://github.com/Balram-1");
    printTerminal("  Email: your-email@example.com");
    printTerminal("  LinkedIn: https://www.linkedin.com/in/your-profile");
}

// Main input handler
terminalInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const raw = terminalInput.value;
    const command = raw.trim();
    if (command === "") {
        terminalInput.value = "";
        return;
    }

    // echo the command
    printTerminal("C:\\Users\\Balram> " + command);
    terminalInput.value = "";

    const cmd = command.toLowerCase();

    if (cmd === "help") {
        handleHelp();
        return;
    }

    if (cmd === "about") {
        handleAbout();
        return;
    }

    if (cmd === "projects") {
        handleProjects();
        return;
    }

    if (cmd === "skills") {
        handleSkills();
        return;
    }

    if (cmd === "contact") {
        handleContact();
        return;
    }

    if (cmd === "clear") {
        terminalOutput.innerHTML = "";
        return;
    }

    // unknown command
    printTerminal("'" + command + "' is not recognized as an internal or external command.");
});


// ============================================================
// BUTTON HANDLERS (Projects + Terminal)
// ============================================================

// External links (GitHub, Demo) — open safely in new tab
document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-external]");
    if (a) {
        e.preventDefault();
        window.open(a.href, "_blank", "noopener,noreferrer");
        return;
    }

    // Terminal command buttons
    const btn = e.target.closest("[data-cmd]");
    if (btn) {
        const cmd = btn.dataset.cmd;
        if (cmd) runCommandFromButton(cmd);
    }
});

// Helper: run a command as if typed in terminal
function runCommandFromButton(cmd) {
    printTerminal("C:\\Users\\Balram> " + cmd);

    const normalized = cmd.trim().toLowerCase();

    if (normalized === "help") return handleHelp();
    if (normalized === "about") return handleAbout();
    if (normalized === "projects") return handleProjects();
    if (normalized === "skills") return handleSkills();
    if (normalized === "contact") return handleContact();
    if (normalized === "clear") {
        terminalOutput.innerHTML = "";
        return;
    }

    printTerminal("'" + cmd + "' is not recognized as an internal or external command.");
}
