import { ipcMain, dialog } from 'electron'
import pify from 'pify'
import jsonStorage from 'electron-json-storage'
import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'

// Create a persistent storage object similar to locaStorage. Pify promisifies
// it to allow promise, await/async syntax
const storage = pify(jsonStorage)

// set indentation for jsonfile
jsonfile.spaces = 2

const loadJsonFiles = (_dataDir, folder) => {
  const fullPath = `${_dataDir}/${folder}`
  const allFiles = fs.readdirSync(fullPath)
  const jsonData = allFiles
    .filter(filename => {
      return path.extname(filename) === '.json' &&
      !(filename === 'prod.schema.json')
    })
    .map(filename => {
      return {
        filename,
        ...jsonfile.readFileSync(`${fullPath}/${filename}`)
      }
    })

  return jsonData
}

const loadFAOFiles = (_dataDir) => {
  const fullPath = `${_dataDir}/fao-product-list.json`
  return jsonfile.readFileSync(fullPath)
}

const setToStorage = async (name, jsonObj) => {
  try {
    await storage.set(name, jsonObj)
  } catch (err) {
    console.error(err)
  }
}

ipcMain.on('choose-data-dir', event => {
  // dialog.showOpenDialog always returns an array of files/dirs!
  dialog.showOpenDialog({ properties: ['openDirectory'] }, dataDirs => {
    if (!dataDirs) return

    const choosenDir = dataDirs[0]

    const products = loadJsonFiles(choosenDir, 'prods')
    const nutrients = loadJsonFiles(choosenDir, 'nutrs')
    const faos = loadFAOFiles(choosenDir)
    const allData = {products, faos, nutrients}

    // Why are those still Promises??? Read up on async/await

    Promise.all(Object.keys(allData).map(key => {
      return setToStorage(key, allData[key])
    }))
      .then(() => event.sender.send('data-dir-choosen', choosenDir))
      .catch(err => console.error(err))
  })
})

ipcMain.on('save-products', (event, dataDir, products, updatedProduct) => {
  // all this storage stuff is not necessary! I'll keep it for now anyway
  storage.set('products', products)
    .then(err => {
      if (err) return console.error(err)

      jsonfile.writeFileSync(
        `${dataDir}/prods/${updatedProduct.filename}`,
        updatedProduct
      )

      event.sender.send('products-saved')
    })
})
