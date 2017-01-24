import ipcRenderer from 'electron'

const edbApi = {
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
export default edbApi
