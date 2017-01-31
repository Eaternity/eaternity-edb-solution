import * as actions from './action-types'

const initialState = {
  productFilter: 'SHOW_SUBSET',
  visibleTable: 'products',
  searchInput: '',
  orderedKeys: [
    'id',
    'name',
    'co2-value',
    'tags',
    'specification',
    'synonyms',
    'name-english',
    'name-french',
    'nutrition-id',
    'alternatives',
    'standard-origin',
    'origins',
    'production-names',
    'production-values',
    'production-methods',
    'processing-names',
    'processing-values',
    'processing-methods',
    'conservation-names',
    'conservation-values',
    'preservation-methods',
    'packaging-names',
    'packaging-values',
    'packaging-methods',
    'season-begin',
    'season-end',
    'combined-product',
    'density',
    'unit-weight',
    'quantity-comments',
    'quantity-references',
    'consistency',
    'foodwaste',
    'foodwaste-comment',
    'co2-calculation',
    'calculation-process-documentation',
    'info-text',
    'references',
    'other-references',
    'comments',
    'co2-calculation-parameters',
    'references-parameters',
    'data-quality',
    'author',
    'delete',
    'filename', // delete later
    'validationSummary' // delete later
  ]
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
