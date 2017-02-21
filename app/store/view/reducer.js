import * as actions from './action-types'

const initialState = {
  productFilter: 'SHOW_SUBSET',
  visibleTable: 'products',
  searchInput: '',
  searchFilter: [
    'Id',
    'Name',
    'Synonyms',
    'Tags',
    'Co2-value'
  ]
}

// this is a comment
const view = (state = initialState, action) => {
  switch (action.type) {
    case actions.TOOGLE_PRODUCT_VISIBILITY:
      return {...state, productFilter: action.payload}

    case actions.TOOGLE_TABLE_VISIBILITY:
      return {...state, visibleTable: action.payload}

    case actions.UPDATE_SEARCH_INPUT:
      return {...state, searchInput: action.payload}

    case actions.CLEAR_SEARCH_INPUT:
      return {...state, searchInput: ''}

    case actions.SET_SEARCH_FILTER:
      return {...state, searchFilter: action.payload}

    default:
      return state
  }
}

export default view
