import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import {partial, pipe} from '../utils/utils'
import {
  loadAllProducts,
  loadFAOs,
  loadNutrs,
  loadNutrChange,
  loadProductSchema,
  removeHelperFields
} from './helpers/helpers'
import {
  _orderProcesses,
  orderProduct,
  addValidationSummary,
  schemaValidate,
  addParentProduct,
  addMissingFields,
  validateNutritionId,
  validateNutrChangeId,
  getFieldFromParent,
  pullMissingFields,
  pullAndAddMissingFields
} from './validator'

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

// load and send productSchema
ipcMain.on('fetch-product-schema', (event, dataDir) => {
  try {
    const productSchema = jsonfile.readFileSync(`${dataDir}/prod.schema.json`)
    // keys are needed to reorder properties, see comment below
    const keys = Object.keys(productSchema.properties)

    // all arguments to event.sender.send will be serialized to json internally!
    // https://github.com/electron/electron/blob/master/docs/api/ipc-renderer.md
    // So the order get lost in ipc... Reorder on the other side!!!
    event.sender.send('product-schema-fetched', productSchema, keys)
  } catch (err) {
    event.sender.send(
      'error-fetching-product-schema',
      `Error: ${err.stack.stack}`
    )
  }
})

// load and send all products
ipcMain.on('fetch-all-products', (event, dataDir) => {
  try {
    const prods = loadAllProducts(dataDir)
    const nutrs = loadNutrs(dataDir)
    const nutrChange = loadNutrChange(dataDir)
    const productSchema = loadProductSchema(dataDir)

    const validateProduct = pipe(
      partial(schemaValidate, productSchema),
      partial(addParentProduct, prods),
      addMissingFields,
      partial(validateNutritionId, nutrs),
      partial(validateNutrChangeId, nutrChange)
    )
    const productValidator = new ProductValidator(dataDir)

    const orderedFixedProducts = productValidator
      .loadAll()
      .validateAllProducts()
      .fixAllProducts()
      .orderFixedProducts()
      .saveOrderedFixedProducts()
      .orderedFixedProducts

    // all arguments to event.sender.send will be serialized to json internally!
    // https://github.com/electron/electron/blob/master/docs/api/ipc-renderer.md
    // So the order get lost in ipc... Reorder on the other side!!!
    event.sender.send('all-products-fetched', orderedFixedProducts)
  } catch (err) {
    event.sender.send(
      'error-fetching-prods',
      `Error: ${err.stack}`
    )
  }
})

// load and send all nutrients
ipcMain.on('fetch-all-nutrients', (event, dataDir) => {
  try {
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
  } catch (err) {
    event.sender.send(
      'error-fetching-nutrients',
      `Error: ${err.stack}`
    )
  }
})

// load and send all faos
ipcMain.on('fetch-all-faos', (event, dataDir) => {
  try {
    const allFAOs = jsonfile.readFileSync(`${dataDir}/fao-product-list.json`)
    event.sender.send('all-faos-fetched', allFAOs)
  } catch (err) {
    event.sender.send(
      'error-fetching-faos',
      `Error: ${err.stack}`
    )
  }
})

// HACK: save all products is triggered when a single product was edited or
// added and saved. This ensures that all new products are validated and/or
// fixed upon save and show up in the invalid product view when invalid
ipcMain.on('save-all-products', (event, dataDir, products) => {
  try {
    const productValidator = new ProductValidator(dataDir)

    const orderedFixedProducts = productValidator
      .loadAll()
      .setProducts(products)
      .validateAllProducts()
      .fixAllProducts()
      .orderFixedProducts()
      .saveOrderedFixedProducts()
      .orderedFixedProducts

    // send fixed products back so they can be put to the redux store.
    // All arguments to event.sender.send will be serialized to json
    // internally! So the order get lost in ipc... Reorder on the other
    // side!!!
    event.sender.send('all-products-saved', orderedFixedProducts)
  } catch (err) {
    event.sender.send(
      'error-saving-products',
      `Error: ${err.stack}`
    )
  }
})

ipcMain.on('save-edited-product', (event, dataDir, editedProduct) => {
  try {
    const productValidator = new ProductValidator(dataDir)

    productValidator
      .loadAll()
      .setProduct(editedProduct)
      .validateProduct()
      .orderValidatedProduct()
      .saveOrderedValidatedProduct()

    event.sender.send('edited-product-saved')
  } catch (err) {
    event.sender.send(
      'error-saving-product',
      `Error: ${err.stack}`
    )
  }
})
