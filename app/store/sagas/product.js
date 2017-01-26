import { call, put, takeLatest } from 'redux-saga/effects'
// import { getProducts } from '../selectors/product'
import fileSystemApi from '../../filesystem-api/filesystem-api'
import * as actionTypes from '../data/action-types'

// worker saga: fires on PRODUCT_FETCH_ALL_REQUESTED
function * fetchAllProducts () {
  try {
    const products = yield call(fileSystemApi.fetchAllProducts)
    yield put({type: actionTypes.PRODUCT_FETCH_ALL_SUCCEEDED, products})
  } catch (err) {
    yield put({type: actionTypes.PRODUCT_FETCH_ALL_FAILED, message: err.message})
  }
}

/* https://stackoverflow.com/questions/37772877/how-to-get-something-from-the-state
-store-inside-a-redux-saga-function
*/
// function * saveProduct () {
//   try {
//     const products = yield select(getProducts)
//     // sagas call method expects an array!!!
//     yield call(edbApi.saveProduct, products)
//     yield put({type: actionTypes.PRODUCT_SAVE_SUCCEEDED})
//   } catch (err) {
//     yield put({type: actionTypes.PRODUCT_SAVE_FAILED, message: err.message})
//   }
// }

// sagas
export function * fetchProductsSaga () {
  yield takeLatest(actionTypes.PRODUCT_FETCH_ALL_REQUESTED, fetchAllProducts)
}

// export function * saveProductSaga () {
//   yield takeLatest(actionTypes.PRODUCT_SAVE_REQUESTED, saveProduct)
// }
