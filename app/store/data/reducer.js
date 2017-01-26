import * as actionTypes from './action-types'

const initialState = {
  dataDir: '',
  products: [],
  faos: [],
  nutrients: [],
  editedProduct: {},
  errorMessages: []
}

const data = (state = initialState, action) => {
  switch (action.type) {

    case actionTypes.SET_DATA_DIR:
      return Object.assign({}, state, {dataDir: action.payload})

    case actionTypes.PRODUCT_FETCH_ALL_SUCCEEDED:
      return Object.assign({}, state, {
        products: action.products
      })

    case actionTypes.PRODUCT_FETCH_ALL_FAILED:
      return Object.assign({}, state, {
        errorMessages: [...state.errorMessages, action.message]
      })

    case actionTypes.SELECT_PRODUCT:
      const indexOfSelectedProduct = state.products.findIndex(product => {
        return product.id === action.id
      })
      return Object.assign({}, state, {
        editedProduct: state.products[indexOfSelectedProduct]
      })

    case actionTypes.MERGE_EDITED_TO_PRODUCTS:
      const editedProduct = state.editedProduct
      const updatedProducts = state.products.map(product => {
        return product.id === editedProduct.id ? editedProduct : product
      })
      return Object.assign({}, state, {
        products: updatedProducts
      })

    case actionTypes.SET_EDITED_PRODUCT_TO_NEW:
      const maxId = state.products.reduce((acc, product) => {
        return (acc >= product.id) ? acc : product.id
      }, 0)
      const id = maxId + 1
      const name = 'newproduct'
      return Object.assign({}, state, {
        editedProduct: {
          name,
          id,
          filename: `${id}-${name}-prod.json`
        }
      })

    case actionTypes.UPDATE_EDITED_PRODUCT:
      let updatedProduct = {}
      if (action.field === 'name') {
        const processedName = action.value.replace(/ /g, '_').toLowerCase()
        const id = state.editedProduct.id
        const ending = 'prod.json'
        const filename = `${id}-${processedName}-${ending}`
        updatedProduct = Object.assign({}, state.editedProduct, {
          name: action.value,
          filename
        })
      } else {
        updatedProduct = Object.assign({}, state.editedProduct, {
          [action.field]: action.value
        })
      }
      return Object.assign({}, state, {
        editedProduct: updatedProduct
      })

    // case actionTypes.PRODUCT_SAVE_FAILED:
    //   return Object.assign({}, state, {
    //     errorMessages: [...state.errorMessages, action.message]
    //   })

    case actionTypes.FAO_FETCH_ALL_SUCCEEDED:
      return Object.assign({}, state, {
        faos: action.faos
      })

    case actionTypes.FAO_FETCH_ALL_FAILED:
      return Object.assign({}, state, {
        errorMessages: [...state.errorMessages, action.message]
      })

    case actionTypes.NUTRIENT_FETCH_ALL_SUCCEEDED:
      return Object.assign({}, state, {
        nutrients: action.nutrients
      })

    case actionTypes.NUTRIENT_FETCH_ALL_FAILED:
      return Object.assign({}, state, {
        errorMessages: [...state.errorMessages, action.message]
      })

    default:
      return state
  }
}

export default data
