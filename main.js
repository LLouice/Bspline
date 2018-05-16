const electron = require('electron')

//  Module to control application life.
const app = electron.app
//  Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// ipcMain Module
const ipcMain = electron.ipcMain

//auto reload
// require('electron-reload')(__dirname);

const path = require('path')
const url = require('url')
const fs = require('fs')



/*************************************************************
 * py process
 *************************************************************/
const PY_DIST_FOLDER = 'pybsplinedist'
const PY_FOLDER = 'pybspline'
const PY_MODULE = 'api' // without .py suffix

let pyProc = null
let pyPort = null

const readAsar = () => {
    console.log("__dirname:", __dirname);
    console.log("__filename:", __filename);
    // console.log(fs.readdirSync(path.resolve(__dirname, "..", PY_DIST_FOLDER, PY_MODULE)));
}

readAsar();
const guessPackaged = () => {
    return fs.readdirSync(path.resolve(__dirname, "..")).indexOf("app.asar") + 1;
}

const guessPyPackaged = () => {
    if (guessPackaged())
        return true;
    else {
        const fullPath = path.join(__dirname, PY_DIST_FOLDER)
        return require('fs').existsSync(fullPath)
    }
}

const getScriptPath = () => {
    if (guessPackaged()) {
        console.log("packaged");
        return path.resolve(__dirname, "..", PY_DIST_FOLDER, PY_MODULE, PY_MODULE + '.exe')
    }
    console.log("not Packaged");
    if (!guessPyPackaged()) {
        return path.join(__dirname, PY_FOLDER, PY_MODULE + '.py')
    }
    if (process.platform === 'win32') {
        return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE + '.exe')
    }
    return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE)
}

const selectPort = () => {
    pyPort = 4243
    return pyPort
}

const createPyProc = () => {
    let script = getScriptPath()
    let port = '' + selectPort()

    console.log("script at", script);
    if (guessPyPackaged()) {
        // connect python subprocess stdio to mian process stdio
        // pyProc = require('child_process').execFile(script, [port])
        pyProc = require('child_process').execFile(script, [port], (error, stdout, stderr) => {

            if (error) {
                throw error;
            }
            console.log(stdout);
        })
    } else {
        pyProc = require('child_process').spawn('python', [script, port]);
        // pyProc = require('child_process').spawn('python', [script, port], {
        //     "stdio": ['ignore', process.stdout, process.stderr]
        // })

        console.log("api.py is running");
    }

    if (pyProc != null) {
        //console.log(pyProc)
        console.log('child process success on port ' + port)
    }
}

const exitPyProc = () => {
    pyProc.kill()
    pyProc = null
    pyPort = null
}

app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)



/*************************************************************
 * window management
 *************************************************************/

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null

function createWindow() {
    console.log('createWindowing ...');
    win = new BrowserWindow({
        // frame: false,
        width: 800,
        height: 600,
        // backgroundColor: '#aa12e0',
        // show: false,
        // resizable: false 
    });




    // local file
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'ui.html'),
        protocol: 'file:',
        slashes: true,
    }))


    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null;
        app.quit();
    })

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('active', () => {
    if (win == null) {
        createWindow();
    }
})


//ipc catch refresh
ipcMain.on('refresh', () => {
    console.log('ipcMain here');
    // win.webContents.reloadIgnoringCache();
    // app.relaunch();
    console.log("relaunch then quit");
    app.quit();
    console.log('quit over');
    app.relaunch();
})