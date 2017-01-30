import * as actions from './action-types'

export const setDataDir = payload => {
  return {
    type: actions.SET_DATA_DIR, payload
  }
}

// products
export const fetchAllProducts = () => {
  return {
    type: actions.PRODUCT_FETCH_ALL_REQUESTED
  }
}

export const saveAllProducts = () => {
  return {
    type: actions.PRODUCT_SAVE_ALL_REQUESTED
  }
}

export const selectProduct = id => {
  return {
    type: actions.SELECT_PRODUCT,
    id
  }
}

export const updateEditedProduct = (field, value) => {
  return {
    type: actions.UPDATE_EDITED_PRODUCT,
    field,
    value
  }
}

export const mergeEditedToProducts = () => {
  return {
    type: actions.MERGE_EDITED_TO_PRODUCTS
  }
}

export const setEditedProductToNew = () => {
  return {
    type: actions.SET_EDITED_PRODUCT_TO_NEW
  }
}

// FAO
export const fetchAllFAOs = () => {
  return {
    type: actions.FAO_FETCH_ALL_REQUESTED
  }
}

// Nutrients
export const fetchAllNutrients = () => {
  return {
    type: actions.NUTRIENT_FETCH_ALL_REQUESTED
  }
}
