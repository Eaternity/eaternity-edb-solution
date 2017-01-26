import { fork } from 'redux-saga/effects'
import { fetchProductsSaga, fetchNutrientsSaga, fetchFAOsSaga } from './filesystem'

function * rootSaga () {
  yield [
    fork(fetchProductsSaga),
    fork(fetchFAOsSaga),
    fork(fetchNutrientsSaga)
  ]
}

export default rootSaga
