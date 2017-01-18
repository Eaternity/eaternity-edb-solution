/* @flow */
import * as actions from './action-types'

const initialState = {
  productFilter: 'SHOW_SUBSET',
  visibleTable: 'products',
  searchInput: ''
}

const view = (state: Object = initialState, action: Object) => {
  switch (action.type) {

    case actions.TOOGLE_PRODUCT_VISIBILITY:
      if (state.productVisibility === 'SHOW_SUBSET') {
        return Object.assign({}, state, {productFilter: 'SHOW_ALL'})
      }
      return Object.assign({}, {productFilter: 'SHOW_SUBSET'})

    case actions.TOOGLE_TABLE_VISIBILITY:
      return Object.assign({}, state, {visibleTable: action.table})

    case actions.UPDATE_SEARCH_INPUT:
      return Object.assign({}, state, {searchInput: action.inputValue})

    case actions.CLEAR_SEARCH_INPUT:
      return Object.assign({}, state, {searchInput: ''})

    default:
      return state
  }
}

export default view
