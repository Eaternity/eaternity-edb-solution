import {app, BrowserWindow, Menu} from 'electron'
import './ipc/ipc-main'

let mainWindow = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support') // eslint-disable-line
  sourceMapSupport.install()
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')() // eslint-disable-line global-require
  const path = require('path') // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules') // eslint-disable-line
  require('module').globalPaths.push(p) // eslint-disable-line
}

app.on('window-all-closed', () => {
  app.quit()
})

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer') // eslint-disable-line global-require

    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS
    for (const name of extensions) {
      // eslint-disable-line
      try {
        await installer.default(installer[name], forceDownload)
      } catch (e) {} // eslint-disable-line
    }
  }
}

app.on('ready', async () => {
  await installExtensions()

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  })

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools()
  }

  var template = [
    {
      label: 'Application',
      submenu: [
        {
          label: 'About Application',
          selector: 'orderFrontStandardAboutPanel:'
        },
        {type: 'separator'},
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function () {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
        {label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
        {type: 'separator'},
        {label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
        {label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
        {label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
})
