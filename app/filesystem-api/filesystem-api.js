// Use ipc to commuticate with the main process and get filesystem access. All
//  filesystem operations in ipcMain are implemented synchronously so it will
//  take some ms for the data to come back. The api uses promises to introduce asynchronicity

import { ipcRenderer } from 'electron'

const fileSystemApi = {
  chooseDataDir: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('choose-data-dir')
      ipcRenderer.on('data-dir-choosen', (_, choosenDir) => {
        if (choosenDir) resolve(choosenDir)
      })
    })
  },

  fetchAllProducts: dataDir => {
    return new Promise(resolve => {
      ipcRenderer.send('fetch-all-products', dataDir)
      ipcRenderer.on('all-products-fetched', (_, products) => {
        resolve(products)
      })
    })
  },

  fetchAllFAOs: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-all-faos', dataDir)
      ipcRenderer.on('all-faos-fetched', (_, faos) => {
        resolve(faos)
      })
    })
  },

  fetchAllNutrients: dataDir => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-all-nutrients', dataDir)
      ipcRenderer.on('all-nutrients-fetched', (_, nutrients) => {
        resolve(nutrients)
      })
    })
  },

  saveProduct: product => {
    ipcRenderer.send('save-product', product)
    return new Promise((resolve, reject) => {
      ipcRenderer.on('all-nutrients-fetched', (nutrients) => {
        resolve(nutrients)
      })
    })
  }

}
export default fileSystemApi
