import * as actionTypes from './action-types'

const initialState = {
  dataDir: '',
  products: [],
  faos: [],
  nutrients: [],
  editedProduct: {},
  productType: 'old',
  errorMessages: []
}

const data = (state = initialState, action) => {
  switch (action.type) {

    case actionTypes.SET_DATA_DIR:
      return {...state, dataDir: action.payload}

    case actionTypes.PRODUCT_FETCH_ALL_SUCCEEDED:
      return {...state, products: action.products}

    case actionTypes.PRODUCT_FETCH_ALL_FAILED:
      return {...state, errorMessages: [...state.errorMessages, action.message]}

    case actionTypes.PRODUCT_SAVE_ALL_SUCCEEDED:
      return {...state, products: action.products}

    case actionTypes.PRODUCT_SAVE_ALL_FAILED:
      return {...state, errorMessages: [...state.errorMessages, action.message]}

    case actionTypes.SELECT_PRODUCT:
      const id = state.products.findIndex(product => {
        return product.id === action.id
      })

      return {...state, editedProduct: state.products[id]}

    case actionTypes.MERGE_EDITED_TO_PRODUCTS:
      const editedProduct = state.editedProduct
      let updatedProducts = []
      const productExists = state.products
        .map(prod => prod.id)
        .includes(editedProduct.id)

      if (productExists) {
        updatedProducts = state.products.map(product => {
          return product.id === editedProduct.id ? editedProduct : product
        })
      } else {
        updatedProducts = [...state.products, editedProduct]
      }

      return {...state, products: updatedProducts}

    case actionTypes.SET_EDITED_PRODUCT_TO_NEW:
      let maxId = state.products.reduce((acc, product) => {
        return (acc >= product.id) ? acc : product.id
      }, 0)

      const newId = maxId + 1

      const name = 'newproduct'
      return {
        ...state,
        editedProduct: {
          name,
          id: newId,
          filename: `${newId}-${name}-prod.json`
        }
      }

    case actionTypes.SET_PRODUCT_TYPE:
      return {...state, productType: action.payload}

    case actionTypes.UPDATE_EDITED_PRODUCT:
      let updatedProduct = action.payload.editedProduct

      if (state.productType === 'new') {
        const processedName = updatedProduct.name
          .replace(/ /g, '_').toLowerCase()
          // replace german umlauts; ä with a and so on...
          .replace(/\u00e4/g, 'a')
          .replace(/\u00f6/g, 'o')
          .replace(/\u00fc/g, 'u')
          .replace(/\u00df/g, 's')

        const id = state.editedProduct.id
        const ending = 'prod.json'
        const filename = `${id}-${processedName}-${ending}`

        updatedProduct = {...updatedProduct, filename}
      }

      return {...state, editedProduct: updatedProduct}

    case actionTypes.FAO_FETCH_ALL_SUCCEEDED:
      return {...state, faos: action.faos}

    case actionTypes.FAO_FETCH_ALL_FAILED:
      return {...state, errorMessages: [...state.errorMessages, action.message]}

    case actionTypes.NUTRIENT_FETCH_ALL_SUCCEEDED:
      return {...state, nutrients: action.nutrients}

    case actionTypes.NUTRIENT_FETCH_ALL_FAILED:
      return {...state, errorMessages: [...state.errorMessages, action.message]}

    default:
      return state
  }
}

export default data
