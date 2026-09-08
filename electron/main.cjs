const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let pythonProcess = null;

function startPythonBackend() {
  const projectRoot = path.join(__dirname, "..");
  const pythonScript = path.join(projectRoot, "server", "main.py");

  console.log(`[AquaGuard Electron] Launching Python backend: python ${pythonScript}`);
  try {
    pythonProcess = spawn("python", [pythonScript], {
      cwd: projectRoot,
      stdio: "pipe",
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });

    if (pythonProcess.stdout) {
      pythonProcess.stdout.on("data", (data) => {
        console.log(`[Python Server] ${data.toString().trim()}`);
      });
    }

    if (pythonProcess.stderr) {
      pythonProcess.stderr.on("data", (data) => {
        console.warn(`[Python Server Log] ${data.toString().trim()}`);
      });
    }

    pythonProcess.on("close", (code) => {
      console.log(`[AquaGuard Electron] Python backend process exited with code ${code}`);
      pythonProcess = null;
    });

    pythonProcess.on("error", (err) => {
      console.error("[AquaGuard Electron] Failed to spawn Python backend:", err);
    });
  } catch (err) {
    console.error("[AquaGuard Electron] Exception spawning Python backend:", err);
  }
}

function stopPythonBackend() {
  if (pythonProcess) {
    console.log("[AquaGuard Electron] Shutting down Python backend process...");
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", pythonProcess.pid.toString(), "/f", "/t"]);
      } else {
        pythonProcess.kill("SIGTERM");
      }
    } catch (e) {
      console.error("[AquaGuard Electron] Error terminating Python process:", e);
    }
    pythonProcess = null;
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    title: "AquaGuard Studio - Hydrogeological Intelligence Platform",
    backgroundColor: "#030712",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  startPythonBackend();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("will-quit", () => {
  stopPythonBackend();
});

app.on("window-all-closed", () => {
  stopPythonBackend();
  if (process.platform !== "darwin") {
    app.quit();
  }
});