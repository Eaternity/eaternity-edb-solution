// Use ipc to commuticate with the main process and get filesystem access. All
// filesystem operations in ipcMain are implemented synchronously so it will
// take some ms for the data to come back. The api uses promises to introduce
// asynchronicity

import { ipcRenderer } from 'electron'

const fileSystemApi = {
  chooseDataDir: () => {
    return new Promise(resolve => {
      ipcRenderer.send('choose-data-dir')

      ipcRenderer.once('data-dir-choosen', (_, choosenDir) => {
        if (choosenDir) resolve(choosenDir)
      })
    })
  },

  fetchProductSchema: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-product-schema', dataDir)

      ipcRenderer.once('product-schema-fetched', (_, productSchema, keys) => {
        ipcRenderer.removeAllListeners('error-fetching-product-schema')
        const { properties } = productSchema
        let orderedProperties = {}
        keys.forEach(key => {
          orderedProperties[key] = properties[key]
        })
        resolve({...productSchema, properties: orderedProperties})
      })

      ipcRenderer.once('error-fetching-product-schema', (_, error) => {
        ipcRenderer.removeAllListeners('product-schema-fetched')
        console.error(error)
        reject(error)
      })
    })
  },

  // dataDir is extracted from the state by the fetchAllProducts saga!
  fetchAllProducts: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-all-products', dataDir)

      ipcRenderer.once('all-products-fetched', (_, products) => {
        ipcRenderer.removeAllListeners('error-fetching-prods')
        resolve(products)
      })

      ipcRenderer.once('error-fetching-prods', (_, error) => {
        ipcRenderer.removeAllListeners('all-products-fetched')
        console.error(error)
        reject(error)
      })
    })
  },

  // dataDir is extracted from the state by the fetchAllProducts saga!
  fetchAllFAOs: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-all-faos', dataDir)

      ipcRenderer.once('all-faos-fetched', (_, faos) => {
        ipcRenderer.removeAllListeners('error-fetching-faos')
        resolve(faos)
      })

      ipcRenderer.once('error-fetching-faos', (_, error) => {
        ipcRenderer.removeAllListeners('all-faos-fetched')
        console.error(error)
        reject(error)
      })
    })
  },

  // dataDir is extracted from the state by the fetchAllProducts saga!
  fetchAllNutrients: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-all-nutrients', dataDir)

      ipcRenderer.once('all-nutrients-fetched', (_, nutrients) => {
        ipcRenderer.removeAllListeners('error-fetching-nutrients')
        resolve(nutrients)
      })

      ipcRenderer.once('error-fetching-nutrients', (_, error) => {
        ipcRenderer.removeAllListeners('all-nutrients-fetched')
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

      ipcRenderer.once('all-products-saved', (_, products) => {
        ipcRenderer.removeAllListeners('error-saving-products')
        resolve(products)
      })

      ipcRenderer.once('error-saving-products', (_, error) => {
        ipcRenderer.removeAllListeners('all-products-saved')
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

      ipcRenderer.once('edited-product-saved', () => {
        ipcRenderer.removeAllListeners('error-saving-product')
        resolve()
      })

      ipcRenderer.once('error-saving-product', (_, error) => {
        ipcRenderer.removeAllListeners('edited-product-saved')
        console.error(error)
        reject(error)
      })
    })
  }
}

export default fileSystemApi
