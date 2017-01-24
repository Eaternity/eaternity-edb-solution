/* @flow */

/*
  This is were classic asynchronous api/http calls would go. I used electron-json-storage to create a similar situation. electron-json-storage is not be necessary to run the app...
*/

import jsonStore from 'electron-json-storage'
import pify from 'pify'

const storage = pify(jsonStore)

const edbApi = {
  fetchAllProducts: () => {
    return storage.get('validatedProducts')
  },

  // saveProduct: products => {
  //   //storage has no method to set a single product...
  //   return storage.set('products', products)
  // },

  fetchAllFAOs: () => {
    return storage.get('faos')
  },

  fetchAllNutrients: () => {
    return storage.get('nutrients')
  }
}

export default edbApi
