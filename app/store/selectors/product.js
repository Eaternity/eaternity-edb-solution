/*
Trying to make preselection/ filtering of products more effective... See https://github.com/reactjs/reselect, this is too much for me ;-)
*/
import { createSelector } from 'reselect'

const getVisibilityFilter = state => state.view.productFilter
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
            Product: product.name,
            Id: product.id,
            'Co2-value': product['co2-value'],
            Synonyms: product.synonyms,
            Tags: product.tags
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
// export { getProducts }
export { getDataDir, getProducts }

// Get the highest id of all products so new products can get maxId + 1
// export const maxIdSelector = createSelector(
//   getProducts,
//   products => products.reduce((acc, product) => {
//     return (acc >= product.id) ? acc : product.id
//   }, 0)
// )
