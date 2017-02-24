import { fork } from 'redux-saga/effects'
import {
  fetchProductSchemaSaga,
  fetchProductsSaga,
  fetchNutrientsSaga,
  fetchFAOsSaga,
  saveProductsSaga,
  saveEditedProductSaga
 } from './filesystem'

function * rootSaga () {
  yield [
    fork(fetchProductSchemaSaga),
    fork(fetchProductsSaga),
    fork(fetchFAOsSaga),
    fork(fetchNutrientsSaga),
    fork(saveProductsSaga),
    fork(saveEditedProductSaga)
  ]
}

export default rootSaga
