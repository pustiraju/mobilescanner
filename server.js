//good using java is better option
const { exec } = require("child_process");

const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");

const sourceFolder = "/sdcard/DCIM/Camera"; // Mobile folder
const destinationFolder = path.resolve(__dirname, "photos"); // Local folder


if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
}

const processedFiles = new Set(); // Track already processed files


function pullFiles() {
    exec(`adb pull ${sourceFolder} ${destinationFolder}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`[${new Date().toISOString()}] Error pulling files: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`[${new Date().toISOString()}] ADB stderr: ${stderr}`);
        }
        console.log(`[${new Date().toISOString()}] Pulled files: ${stdout}`);
    });
}

function getChromePath() {
    const os = process.platform;
    if (os === "win32") {
        return '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
    } else if (os === "darwin") {
        return "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome";
    } else if (os === "linux") {
        return "google-chrome";
    } else {
        throw new Error("Unsupported OS for Chrome path detection.");
    }
}

function openInChrome(filePath) {
    const chromePath = getChromePath();
    exec(`${chromePath} --new-tab "file://${filePath}"`, (error) => {
        if (error) {
            console.error(`[${new Date().toISOString()}] Error opening file in Chrome: ${error.message}`);
        } else {
            console.log(`[${new Date().toISOString()}] Opened in Chrome: ${filePath}`);
        }
    });
}


const watcher = chokidar.watch(destinationFolder, { ignoreInitial: true });
watcher.on("add", (filePath) => {
    if (!processedFiles.has(filePath)) {
        console.log(`[${new Date().toISOString()}] New file detected: ${filePath}`);
        openInChrome(filePath);
        processedFiles.add(filePath); // Mark the file as processed
    }
});

// Initial pull and then periodically update
pullFiles();
setInterval(pullFiles, 10000); 
