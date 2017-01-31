// Trying to make preselection/ filtering of products more effective... See
// https://github.com/reactjs/reselect I think this is very important with
// bigger datasets to optimize performance... Not so much here... It's hard to
// understand for me ;-)
import { createSelector } from 'reselect'

const getVisibilityFilter = state => state.view.productFilter
const getOrderedKeys = state => state.view.orderedKeys
const getProducts = state => state.data.products
const getDataDir = state => state.data.dataDir

export const getVisibleProducts = createSelector(
  [ getVisibilityFilter, getProducts ],
  (productFilter, products) => {
    switch (productFilter) {
      case 'SHOW_ALL':
        return products

      case 'SHOW_SUBSET':
        return products.map(product => {
          return {
            id: product.id,
            name: product.name,
            specification: product.specification
              ? `(${product.specification})` : '',
            'co2-value': product['co2-value'],
            synonyms: product.synonyms ? product.synonyms.join(', ') : '',
            tags: product.tags
          }
        })

      case 'SHOW_INVALID':
        return products
          .filter(product => product.validationSummary.isValid === false)
          .map(product => {
            return {
              id: product.id,
              name: product.name,
              missingFields: product.validationSummary.missingFields.join(', '),
              brokenLinks: product.validationSummary.brokenLinks.join(', ')
            }
          })
    }
  }
)

// Export selectors for saga
export { getDataDir, getProducts, getOrderedKeys }
