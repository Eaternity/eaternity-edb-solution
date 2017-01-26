import { ipcMain, dialog } from 'electron'
// import fs from 'fs'
// import path from 'path'
import jsonfile from 'jsonfile'
// import validateProduct from './validate'
// import fix from './fix'

// set indentation for jsonfile
jsonfile.spaces = 2

// const loadJsonFiles = (_dataDir, folder) => {
//   const fullPath = `${_dataDir}/${folder}`
//   const allFiles = fs.readdirSync(fullPath)
//   const jsonData = allFiles
//     .filter(filename => {
//       return path.extname(filename) === '.json' &&
//       !(filename === 'prod.schema.json')
//     })
//     .map(filename => {
//       return {
//         filename,
//         ...jsonfile.readFileSync(`${fullPath}/${filename}`)
//       }
//     })
//
//   return jsonData
// }
//
// const loadFAOFiles = (_dataDir) => {
//   const fullPath = `${_dataDir}/fao-product-list.json`
//   return jsonfile.readFileSync(fullPath)
// }

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
  console.log('fetch-all-products triggered')
  // const validationResults = validateProduct(dataDir)
  // const fixedProducts = fix(dataDir, validationResults)
  // event.sender.send('all-products-fetched', fixedProducts)
})

// load and send all nutrients
ipcMain.on('fetch-all-nutrients', (event, dataDir) => {
  console.log('fetch-all-nutrients triggered')
  // const allNutrients = loadJsonFiles(dataDir, 'nutrs')
  // event.sender.send('all-nutrients-fetched', allNutrients)
})

// load and send all faos
ipcMain.on('fetch-all-faos', (event, dataDir) => {
  console.log('fetch-all-faos triggered')
  // const allFaos = loadFAOFiles(dataDir)
  // event.sender.send('all-faos-fetched', allFaos)
})
