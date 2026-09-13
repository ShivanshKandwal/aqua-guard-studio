const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn, execSync } = require("child_process");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let pythonProcess = null;

function findPythonCommand() {
  // Common paths on Windows if "python" is not directly in GUI process PATH
  const candidates = [
    "python",
    "py",
    "python3",
    path.join(process.env.USERPROFILE || "", "miniconda3", "python.exe"),
    path.join(process.env.USERPROFILE || "", "anaconda3", "python.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Programs", "Python", "Python313", "python.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Programs", "Python", "Python312", "python.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Programs", "Python", "Python311", "python.exe"),
  ];

  for (const cmd of candidates) {
    if (cmd.includes(path.sep) && fs.existsSync(cmd)) {
      return cmd;
    }
  }
  return "python";
}

function resolveServerScript() {
  // 1. In development, point to repo server/main.py
  const devPath = path.join(__dirname, "..", "server", "main.py");
  if (fs.existsSync(devPath)) {
    return { script: devPath, cwd: path.join(__dirname, "..") };
  }

  // 2. In packaged mode, extraResources places server in resources/server/main.py
  const resourcePath = path.join(process.resourcesPath, "server", "main.py");
  if (fs.existsSync(resourcePath)) {
    return { script: resourcePath, cwd: path.join(process.resourcesPath, "server") };
  }

  // 3. Fallback relative to app path
  const appPath = path.join(app.getAppPath(), "server", "main.py");
  if (fs.existsSync(appPath)) {
    return { script: appPath, cwd: path.join(app.getAppPath(), "server") };
  }

  return { script: devPath, cwd: path.join(__dirname, "..") };
}

function freePortIfBusy(port) {
  if (process.platform === "win32") {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      const lines = output.trim().split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].includes(`:${port}`) && parts[3] === "LISTENING") {
          const pid = parts[parts.length - 1].trim();
          if (pid && pid !== "0" && pid !== String(process.pid)) {
            console.log(`[AquaSentinel Electron] Releasing busy port ${port} from process PID ${pid}`);
            execSync(`taskkill /pid ${pid} /f /t`, { stdio: "ignore" });
          }
        }
      }
    } catch (e) {
      // Port is clear or netstat returned non-zero (which is expected if nothing listening)
    }
  }
}

function startPythonBackend() {
  freePortIfBusy(8000);
  const { script: pythonScript, cwd: workingDir } = resolveServerScript();
  const pythonBinary = findPythonCommand();

  console.log(`[AquaSentinel Electron] Launching Python backend: "${pythonBinary}" "${pythonScript}" in "${workingDir}"`);
  try {
    pythonProcess = spawn(pythonBinary, [pythonScript], {
      cwd: workingDir,
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
      console.log(`[AquaSentinel Electron] Python backend process exited with code ${code}`);
      pythonProcess = null;
    });

    pythonProcess.on("error", (err) => {
      console.error("[AquaSentinel Electron] Failed to spawn Python backend:", err);
    });
  } catch (err) {
    console.error("[AquaSentinel Electron] Exception spawning Python backend:", err);
  }
}

function stopPythonBackend() {
  if (pythonProcess && pythonProcess.pid) {
    console.log("[AquaSentinel Electron] Shutting down Python backend process PID:", pythonProcess.pid);
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /pid ${pythonProcess.pid} /f /t`, { stdio: "ignore" });
      } else {
        pythonProcess.kill("SIGTERM");
      }
    } catch (e) {
      console.error("[AquaSentinel Electron] Error terminating Python process:", e);
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
    title: "AquaSentinel - Hydrogeological Intelligence Platform",
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

app.on("before-quit", () => {
  stopPythonBackend();
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