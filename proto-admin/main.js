const { app, BrowserWindow, screen } = require("electron");

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  let win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: false,
    },
    title: "[Admin] Index Maria Valtorta",
  });

  win.setMenu(null);

  win.loadFile("dist/prototype-front-admin/browser/index.html");
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
