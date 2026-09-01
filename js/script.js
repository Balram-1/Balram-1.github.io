console.log("javascript connected");

// ============================================================
// STARTUP SCREEN
// ============================================================
window.addEventListener("load", () => {
    const startup = document.getElementById("startup-screen");
    if (startup) {
        setTimeout(() => {
            startup.classList.add("fade-out");
            setTimeout(() => {
                startup.classList.add("hidden");
            }, 500); // match CSS transition duration
        }, 2500); // 2.5 seconds loading
    }
});// ============================================================
// GLOBAL WINDOW Z-INDEX
// ============================================================

let topZIndex = 10;

function bringWindowToFront(windowElement) {
    topZIndex++;
    windowElement.style.zIndex = topZIndex;

    // Remove active-window class from all windows
    document.querySelectorAll('.window').forEach(win => win.classList.remove('active-window'));
    // Add active-window class to this window
    windowElement.classList.add('active-window');

    // Remove active state from all taskbar buttons
    document.querySelectorAll('.taskbar-button').forEach(btn => btn.classList.remove('taskbar-button-active'));
    // Add active state to this window's taskbar button
    if (windowElement.taskbarButton) {
        windowElement.taskbarButton.classList.add('taskbar-button-active');
    }
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
// START MENU & SHUTDOWN
// ============================================================
const startButton = document.getElementById("startbutton");
const startMenu = document.getElementById("start-menu");
const shutdownScreen = document.getElementById("shutdown-screen");
const shutdownText = document.getElementById("shutdown-text");

if (startButton && startMenu) {
    startButton.addEventListener("click", (e) => {
        e.stopPropagation();
        startMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenu.classList.add("hidden");
        }
    });

    // Start menu items
    document.querySelectorAll(".start-menu-item").forEach(item => {
        item.addEventListener("click", () => {
            startMenu.classList.add("hidden"); // close menu
            const app = item.dataset.app;
            if (app) {
                const windowSelector = `#${app}-window`;
                const windowElement = document.querySelector(windowSelector);
                if (windowElement) {
                    windowElement.classList.remove("minimized");
                    windowElement.classList.add("open");
                    bringWindowToFront(windowElement);
                    if (!windowElement.taskbarButton) {
                        const label = item.querySelector("span").textContent.trim();
                        windowElement.taskbarButton = createTaskbarButton(label, windowElement);
                    }
                }
            } else if (item.id === "start-shutdown") {
                // Initiate shutdown sequence
                document.querySelectorAll(".window").forEach(w => w.classList.remove("open"));
                shutdownScreen.classList.remove("hidden");
                setTimeout(() => {
                    shutdownText.textContent = "It is now safe to close this tab.";
                }, 2000);
            }
        });
    });
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
const guestbookWindow = document.querySelector("#guestbook-window");
if (guestbookWindow) initializeWindow(guestbookWindow, "Guestbook");

// CTF Vault
/*
const ctfvaultWindow = document.querySelector("#ctfvault-window");
if (ctfvaultWindow) initializeWindow(ctfvaultWindow, "CTF Vault");
*/
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
    printTerminal("  Email: balrampreet@tutamail.com");
    printTerminal("  LinkedIn: https://www.linkedin.com/in/balrampreet/");
}

function handleWhoami() { printTerminal("balrampreet — cybersecurity student, ctf player, builder"); }
function handlePwd() { printTerminal("C:\\Users\\Balram"); }
function handleDate() { printTerminal(new Date().toString()); }
function handleSudo() { printTerminal("Nice try."); }
function handleHack() { printTerminal("Initiating hack... just kidding."); }
function handleLs() {
    printTerminal(" Directory of C:\\Users\\Balram\n");
    printTerminal("[DIR]  Desktop");
    printTerminal("[DIR]  Projects");
    printTerminal("[DIR]  CTF_Vault");
    printTerminal("[DIR]  Downloads");
    printTerminal("       stegolab.py        4,192 bytes");
    printTerminal("       notes.txt          1,337 bytes");
    printTerminal("       classified.exe     ACCESS DENIED");
}
function handleNeofetch() {
    printTerminal("        ██████");
    printTerminal("      ██░░░░░░██          balrampreet@BALRAM-PC");
    printTerminal("    ██░░░░░░░░░░██        ─────────────────────");
    printTerminal("    ██░░░░░░░░░░██        OS: Windows XP Professional");
    printTerminal("    ██░░░░░░░░░░██        Shell: cmd.exe");
    printTerminal("    ██░░░░░░░░░░██        Role: Cybersecurity Student");
    printTerminal("      ██░░░░░░██          Focus: Offensive · Network · CTF");
    printTerminal("        ██████            GitHub: github.com/Balram-1");
    printTerminal("                          Email: balrampreet@tutamail.com");
}
function handleHistory() {
    if (commandHistory.length === 0) {
        printTerminal("No history available.");
        return;
    }
    const start = Math.max(0, commandHistory.length - 10);
    for (let i = start; i < commandHistory.length; i++) {
        printTerminal(`  ${i + 1}  ${commandHistory[i]}`);
    }
}

// Main input handler
let commandHistory = [];
let historyIndex = -1;

terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
        }
        return;
    }
    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
        } else if (historyIndex === 0) {
            historyIndex = -1;
            terminalInput.value = "";
        }
        return;
    }

    if (event.key !== "Enter") return;

    const raw = terminalInput.value;
    const command = raw.trim();
    if (command === "") {
        terminalInput.value = "";
        return;
    }

    commandHistory.push(command);
    historyIndex = -1; // reset

    // echo the command
    printTerminal("C:\\Users\\Balram> " + command);
    terminalInput.value = "";

    const cmd = command.toLowerCase();

    if (cmd === "help") return handleHelp();
    if (cmd === "about") return handleAbout();
    if (cmd === "projects") return handleProjects();
    if (cmd === "skills") return handleSkills();
    if (cmd === "contact") return handleContact();
    if (cmd === "clear") {
        terminalOutput.innerHTML = "";
        return;
    }
    if (cmd === "whoami") return handleWhoami();
    if (cmd === "pwd") return handlePwd();
    if (cmd === "date") return handleDate();
    if (cmd === "sudo") return handleSudo();
    if (cmd === "hack") return handleHack();
    if (cmd === "ls") return handleLs();
    if (cmd === "neofetch") return handleNeofetch();
    if (cmd === "history") return handleHistory();

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
    
    if (normalized !== "clear" && normalized !== "") {
        if (typeof commandHistory !== 'undefined') {
            commandHistory.push(cmd.trim());
        }
    }

    if (normalized === "help") return handleHelp();
    if (normalized === "about") return handleAbout();
    if (normalized === "projects") return handleProjects();
    if (normalized === "skills") return handleSkills();
    if (normalized === "contact") return handleContact();
    if (normalized === "clear") {
        terminalOutput.innerHTML = "";
        return;
    }
    if (normalized === "whoami") return handleWhoami();
    if (normalized === "pwd") return handlePwd();
    if (normalized === "date") return handleDate();
    if (normalized === "sudo") return handleSudo();
    if (normalized === "hack") return handleHack();
    if (normalized === "ls") return handleLs();
    if (normalized === "neofetch") return handleNeofetch();
    if (normalized === "history") return handleHistory();

    printTerminal("'" + cmd + "' is not recognized as an internal or external command.");
}
