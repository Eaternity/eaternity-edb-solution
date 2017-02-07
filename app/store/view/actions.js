import * as actions from './action-types'

export const toggleProductVisibility = payload => {
  return {
    type: actions.TOOGLE_PRODUCT_VISIBILITY,
    payload
  }
}

export const toggleTableVisibility = payload => {
  return {
    type: actions.TOOGLE_TABLE_VISIBILITY,
    payload
  }
}

export const updateSearchInput = payload => {
  return {
    type: actions.UPDATE_SEARCH_INPUT,
    payload
  }
}

export const clearSearchInput = () => ({type: actions.CLEAR_SEARCH_INPUT})

export const setSearchFilter = payload => {
  return {
    type: actions.SET_SEARCH_FILTER,
    payload
  }
}
