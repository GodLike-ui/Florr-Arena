const { app, BrowserWindow, screen } = require("electron");

function createWindow() {
    let win = new BrowserWindow({
        icon: "../public/icons/favicon.png",
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.removeMenu();
    win.maximize();

    win.loadFile("../public/stuff.html"); // make this load actual link instead of file path
    win.on('close', () => {               // in future
        win.destroy();
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});