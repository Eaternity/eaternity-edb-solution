import { fork } from 'redux-saga/effects'
import {
  fetchProductsSaga,
  fetchNutrientsSaga,
  fetchFAOsSaga,
  saveProductsSaga,
  saveEditedProductSaga
 } from './filesystem'

function * rootSaga () {
  yield [
    fork(fetchProductsSaga),
    fork(fetchFAOsSaga),
    fork(fetchNutrientsSaga),
    fork(saveProductsSaga),
    fork(saveEditedProductSaga)
  ]
}

export default rootSaga
