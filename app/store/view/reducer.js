import * as actions from './action-types'

const initialState = {
  productFilter: 'SHOW_SUBSET',
  visibleTable: 'products',
  searchInput: ''
}
// this is a comment
const view = (state = initialState, action) => {
  switch (action.type) {
    case actions.TOOGLE_PRODUCT_VISIBILITY:
      return Object.assign({}, state, {productFilter: action.payload})

    case actions.TOOGLE_TABLE_VISIBILITY:
      return Object.assign({}, state, {visibleTable: action.payload})

    case actions.UPDATE_SEARCH_INPUT:
      return Object.assign({}, state, {searchInput: action.payload})

    case actions.CLEAR_SEARCH_INPUT:
      return Object.assign({}, state, {searchInput: ''})

    default:
      return state
  }
}

export default view
