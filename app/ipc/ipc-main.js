import {ipcMain, dialog} from 'electron'
import jsonfile from 'jsonfile'
import {pipe} from 'ramda'
import {
  loadAllProducts,
  loadFaos,
  loadNutrs,
  loadNutrChange,
  loadProductSchema,
  saveProduct,
  saveAllProducts,
  saveAllProductsToCsv
} from '../validator/helpers/helpers'
import {
  orderProduct,
  removeEmptyFields,
  schemaValidate,
  addParentProduct,
  addMissingFields,
  validateNutritionId,
  validateNutrChangeId,
  classify,
  pullAndAddMissingFields
} from '../validator/validator'

// set indentation for jsonfile
jsonfile.spaces = 2

// choose the _data directory
ipcMain.on('choose-data-dir', event => {
  // dialog.showOpenDialog always returns an array of files/dirs!
  dialog.showOpenDialog({properties: ['openDirectory']}, dataDirs => {
    if (!dataDirs) return
    const dataDir = dataDirs[0]
    event.sender.send('data-dir-choosen', dataDir)
  })
})

// load and send productSchema
ipcMain.on('fetch-product-schema', (event, dataDir) => {
  try {
    const productSchema = loadProductSchema(dataDir)
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
    const fields = Object.keys(productSchema.properties)

    const validateProduct = pipe(
      schemaValidate(productSchema),
      addParentProduct(prods),
      addMissingFields,
      validateNutritionId(nutrs),
      validateNutrChangeId(nutrChange),
      classify
    )

    const validatedProducts = prods.map(prod => validateProduct(prod))

    // save all producst to csv when app starts so Isa can start using the csv
    // file straight away
    saveAllProductsToCsv(fields, dataDir, validatedProducts)

    // all arguments to event.sender.send will be serialized to json internally!
    // https://github.com/electron/electron/blob/master/docs/api/ipc-renderer.md
    // So the order get lost in ipc... Reorder on the other side!!!
    event.sender.send('all-products-fetched', validatedProducts)
  } catch (err) {
    event.sender.send('error-fetching-prods', `Error: ${err.stack}`)
  }
})

// load and send all nutrients
ipcMain.on('fetch-all-nutrients', (event, dataDir) => {
  try {
    const nutrs = loadNutrs(dataDir)
    event.sender.send('all-nutrients-fetched', nutrs)
  } catch (err) {
    event.sender.send('error-fetching-nutrients', `Error: ${err.stack}`)
  }
})

// load and send all faos
ipcMain.on('fetch-all-faos', (event, dataDir) => {
  try {
    const faos = loadFaos(dataDir)
    event.sender.send('all-faos-fetched', faos)
  } catch (err) {
    event.sender.send('error-fetching-faos', `Error: ${err.stack}`)
  }
})

// HACK: save all products is triggered when a single product was edited or
// added and saved. This ensures that all new products are validated and/or
// fixed upon save and show up in the invalid product view when invalid
ipcMain.on('save-all-products', (event, dataDir, products) => {
  try {
    // reset validation aka remove validationSummary
    const nutrs = loadNutrs(dataDir)
    const nutrChange = loadNutrChange(dataDir)
    const productSchema = loadProductSchema(dataDir)
    const orderedKeys = Object.keys(productSchema.properties)
    const enhancedKeys = [...orderedKeys, 'filename', 'validationSummary']

    // the products coming from the client/renderer contain exactly one
    // new or edited product. All products get validated again against products.
    const validateProduct = pipe(
      removeEmptyFields(enhancedKeys),
      orderProduct(enhancedKeys),
      schemaValidate(productSchema),
      addParentProduct(products),
      addMissingFields,
      validateNutritionId(nutrs),
      validateNutrChangeId(nutrChange),
      classify
    )

    // validated products without any pulled fields get send back to renderer
    const validatedProducts = products.map(prod => validateProduct(prod))

    // pull all fields from parent and save as prods.all.json
    const enhancedProds = validatedProducts.map(prod =>
      pullAndAddMissingFields(products, prod)
    )

    saveAllProducts(dataDir, enhancedProds)
    saveAllProductsToCsv(orderedKeys, dataDir, validatedProducts)

    event.sender.send('all-products-saved', validatedProducts)
  } catch (err) {
    event.sender.send('error-saving-products', `Error: ${err.stack}`)
  }
})

ipcMain.on('save-edited-product', (event, dataDir, editedProduct) => {
  try {
    const productSchema = loadProductSchema(dataDir)
    const orderedKeys = Object.keys(productSchema.properties)
    const enhancedKeys = [...orderedKeys, 'filename', 'validationSummary']

    const orderAndSave = pipe(
      removeEmptyFields(enhancedKeys),
      orderProduct(enhancedKeys),
      saveProduct(dataDir)
    )

    orderAndSave(editedProduct)

    event.sender.send('edited-product-saved')
  } catch (err) {
    event.sender.send('error-saving-product', `Error: ${err.stack}`)
  }
})
