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
  try {
    const productValidator = new ProductValidator()
    const fixedProducts = productValidator
      .setDataDir(dataDir)
      .validateAllProducts()
      .fixAllProducts()
      // HACK: saving fixed products array here although only fetch-all-products
      // was listened for...
      .saveFixedProducts()
      .fixedProducts

    event.sender.send('all-products-fetched', fixedProducts)
  } catch (err) {
    event.sender.send('error', err)
  }
})

// load and send all nutrients
ipcMain.on('fetch-all-nutrients', (event, dataDir) => {
  const nutrientFileNames = fs.readdirSync(`${dataDir}/nutrs`)
    .filter(filename => {
      // json files only...
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

// HACK: save all products is triggered when a single product was edited or
// added and saved. This ensures that all new products are validated and/or
// fixed upon save and show up in the invalid product view when invalid
ipcMain.on('save-all-products', (event, dataDir, products) => {
  // validate, fix and save products
  const productValidator = new ProductValidator()
  const fixedProducts = productValidator
    .setDataDir(dataDir)
    .validateAllProducts(products)
    .fixAllProducts()
    .saveFixedProducts()
    .fixedProducts

  // send fixed products back so they can be put to the redux store. This
  event.sender.send('all-products-saved', fixedProducts)
})
