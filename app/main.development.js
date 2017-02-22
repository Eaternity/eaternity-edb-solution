import { app, BrowserWindow } from 'electron'
import electronLocalshortcut from 'electron-localshortcut'
import './ipc/ipc-main'

let win = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install()
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')() // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer') // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ]
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS
    for (const name of extensions) { // eslint-disable-line
      try {
        await installer.default(installer[name], forceDownload)
      } catch (e) {} // eslint-disable-line
    }
  }
}

app.on('ready', async () => {
  await installExtensions()

  win = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  })

  win.loadURL(`file://${__dirname}/app.html`)

  electronLocalshortcut.register(win, 'CommandOrControl+S', () => {
    console.log('You pressed cmd & S')
    win.webContents.send('save-edited-product')
  })

  const shortcutRegisterd = electronLocalshortcut
    .isRegistered(win, 'CommandOrControl+S')

  if (shortcutRegisterd) {
    console.log(
      'Registered shortcut: CommandOrControl+S => save-edited-product'
    )
  }

  win.webContents.on('did-finish-load', () => {
    win.show()
    win.focus()
  })

  win.on('closed', () => {
    win = null
  })

  if (process.env.NODE_ENV === 'development') {
    win.openDevTools()
  }
})

app.on('will-quit', () => {
  // Unregister shortcut.
  electronLocalshortcut.unregister(win, 'CommandOrControl+S')
})

app.on('window-all-closed', () => {
  app.quit()
})
