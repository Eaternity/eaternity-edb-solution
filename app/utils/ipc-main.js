import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import ProductValidator from './validator.js'

// set indentation for jsonfile
jsonfile.spaces = 2

// choose the _data directory
ipcMain.on('choose-data-dir', event => {
  // dialog.showOpenDialog always returns an array of files/dirs!
  dialog.showOpenDialog({ properties: ['openDirectory'] }, dataDirs => {
    if (!dataDirs) return
    const dataDir = dataDirs[0]
    event.sender.send('data-dir-choosen', dataDir)
  })
})

// load and send all products
ipcMain.on('fetch-all-products', (event, dataDir) => {
  const productValidator = new ProductValidator()

  const fixedProducts = productValidator
    .setDataDir(dataDir)
    .validateAllProducts()
    .fixAllProducts()
    .fixedProducts

  event.sender.send('all-products-fetched', fixedProducts)
})

// load and send all nutrients
ipcMain.on('fetch-all-nutrients', (event, dataDir) => {
  const nutrientFileNames = fs.readdirSync(`${dataDir}/nutrs`)
    .filter(filename => {
      // json fiels only...
      const extension = path.extname(filename)
      return extension === '.json'
    })

  const allNutrients = nutrientFileNames
    .map(filename => {
      return jsonfile.readFileSync(`${dataDir}/nutrs/${filename}`)
    })

  event.sender.send('all-nutrients-fetched', allNutrients)
})

// load and send all faos
ipcMain.on('fetch-all-faos', (event, dataDir) => {
  const allFAOs = jsonfile.readFileSync(`${dataDir}/fao-product-list.json`)

  event.sender.send('all-faos-fetched', allFAOs)
})
