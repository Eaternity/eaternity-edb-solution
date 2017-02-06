import * as actions from './action-types'

const initialState = {
  productFilter: 'SHOW_SUBSET',
  visibleTable: 'products',
  searchInput: '',
  orderedKeys: [
    'id',
    'name',
    'linked-id', // added by mcmunder
    'co2-value',
    'tags',
    'specification',
    'synonyms',
    'name-english',
    'name-french',
    'nutrition-id',
    'alternatives',
    'production-names',
    'production-values',
    'processing-names',
    'processing-values',
    'conservation-names',
    'conservation-values',
    'packaging-names',
    'packaging-values',
    'season-begin',
    'season-end',
    'combined-product',
    'density',
    'unit-weight',
    'quantity-comments',
    'quantity-references',
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
