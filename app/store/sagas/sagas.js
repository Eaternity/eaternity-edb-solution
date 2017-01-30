import { fork } from 'redux-saga/effects'
import {
  fetchProductsSaga,
  fetchNutrientsSaga,
  fetchFAOsSaga,
  saveProductsSaga
 } from './filesystem'

function * rootSaga () {
  yield [
    fork(fetchProductsSaga),
    fork(fetchFAOsSaga),
    fork(fetchNutrientsSaga),
    fork(saveProductsSaga)
  ]
}

export default rootSaga
