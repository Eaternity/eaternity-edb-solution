// Use ipc to commuticate with the main process and get filesystem access. All
//  filesystem operations in ipcMain are implemented synchronously so it will
//  take some ms for the data to come back. The api uses promises to account
//  for that... Does this make sense?!

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

  fetchAllProducts: () => {
    ipcRenderer.send('fetch-all-products')
    return new Promise((resolve, reject) => {
      ipcRenderer.on('all-products-fetched', (products) => {
        resolve(products)
      })
    })
  },

  fetchAllFAOs: () => {
    ipcRenderer.send('fetch-all-faos')
    return new Promise((resolve, reject) => {
      ipcRenderer.on('all-faos-fetched', (faos) => {
        resolve(faos)
      })
    })
  },

  fetchAllNutrients: () => {
    ipcRenderer.send('fetch-all-nutrients')
    return new Promise((resolve, reject) => {
      ipcRenderer.on('all-nutrients-fetched', (nutrients) => {
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
