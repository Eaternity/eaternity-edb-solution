import * as actions from './action-types'

export const toggleProductVisibility = () => ({
  type: actions.TOOGLE_PRODUCT_VISIBILITY
})

export const toggleTableVisibility = (table) => ({
  type: actions.TOOGLE_TABLE_VISIBILITY,
  table
})

export const updateSearchInput = (inputValue) => ({
  type: actions.UPDATE_SEARCH_INPUT,
  inputValue
})

export const clearSearchInput = () => ({type: actions.CLEAR_SEARCH_INPUT})
