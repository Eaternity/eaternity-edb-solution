// Use ipc to commuticate with the main process and get filesystem access. All
// filesystem operations in ipcMain are implemented synchronously so it will
// take some ms for the data to come back. The api uses promises to introduce
// asynchronicity

import { ipcRenderer } from 'electron'

const fileSystemApi = {
  chooseDataDir: () => {
    return new Promise(resolve => {
      ipcRenderer.send('choose-data-dir')

      ipcRenderer.on('data-dir-choosen', (_, choosenDir) => {
        if (choosenDir) resolve(choosenDir)
      })
    })
  },

  // dataDir is extracted from the state by the fetchAllProducts saga!
  fetchAllProducts: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-all-products', dataDir)

      ipcRenderer.on('all-products-fetched', (_, products) => {
        resolve(products)
      })

      ipcRenderer.on('error-fetching-prods', (_, error) => {
        console.error(error)
        reject(error)
      })
    })
  },

  // dataDir is extracted from the state by the fetchAllProducts saga!
  fetchAllFAOs: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-all-faos', dataDir)

      ipcRenderer.on('all-faos-fetched', (_, faos) => {
        resolve(faos)
      })

      ipcRenderer.on('error-fetching-faos', (_, error) => {
        console.error(error)
        reject(error)
      })
    })
  },

  // dataDir is extracted from the state by the fetchAllProducts saga!
  fetchAllNutrients: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-all-nutrients', dataDir)

      ipcRenderer.on('all-nutrients-fetched', (_, nutrients) => {
        resolve(nutrients)
      })

      ipcRenderer.on('error-fetching-nutrients', (_, error) => {
        console.error(error)
        reject(error)
      })
    })
  },

  saveAllProducts: args => {
    // why the hell does sagas call() method accept arguments as an array?!!
    const dataDir = args[0]
    const products = args[1]

    return new Promise((resolve, reject) => {
      ipcRenderer.send('save-all-products', dataDir, products)

      ipcRenderer.on('all-products-saved', (_, products) => {
        resolve(products)
      })

      ipcRenderer.on('error-saving-products', (_, error) => {
        console.error(error)
        reject(error)
      })
    })
  },

  saveEditedProduct: args => {
    const dataDir = args[0]
    const editedProduct = args[1]

    return new Promise((resolve, reject) => {
      ipcRenderer.send('save-edited-product', dataDir, editedProduct)

      ipcRenderer.on('edited-product-saved', () => {
        resolve()
      })

      ipcRenderer.on('error-saving-products', (_, error) => {
        console.error(error)
        reject(error)
      })
    })
  }
}

export default fileSystemApi
