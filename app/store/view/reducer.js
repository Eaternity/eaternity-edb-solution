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
  ],
  orderedKeys: [
    'id',
    'name',
    'name-english',
    'name-french',
    'synonyms',
    'co2-value',
    'allergenes', // added by mcmunder
    'tags',
    'linked-id', // added by mcmunder
    'nutrition-id',
    'fao-product-id', // added by mcmunder
    'waste-id', // added by mcmunder
    'specification',
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
    'processes', // added by mcmunder
    'perishability',
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
