// Sagas are redux middleware. They receive all actions after they went through
// the reducers. However, if an action is not handled by the reducers, i.e. the
// action type is not accounted for by any switch case, the saga will be the
// first to do something in response to action. The saga can then extract
// (select) data from the store, fire other actions etc...

import { call, put, select, takeLatest } from 'redux-saga/effects'
import {
  getDataDir,
  getProducts,
  getEditedProduct
} from '../selectors/selector'
import fileSystemApi from '../../filesystem-api/filesystem-api'
import * as actionTypes from '../data/action-types'

// fires on PRODUCT_FETCH_ALL_REQUESTED
function * fetchAllProducts () {
  try {
    const dataDir = yield select(getDataDir)
    const products = yield call(fileSystemApi.fetchAllProducts, dataDir)

    yield put({type: actionTypes.PRODUCT_FETCH_ALL_SUCCEEDED, products})
  } catch (err) {
    yield put({type: actionTypes.PRODUCT_FETCH_ALL_FAILED, message: err})
  }
}

// fires on NUTRIENTS_FETCH_ALL_REQUESTED
function * fetchAllNutrients () {
  try {
    const dataDir = yield select(getDataDir)
    const nutrients = yield call(fileSystemApi.fetchAllNutrients, dataDir)
    yield put({type: actionTypes.NUTRIENT_FETCH_ALL_SUCCEEDED, nutrients})
  } catch (err) {
    yield put({type: actionTypes.NUTRIENT_FETCH_ALL_FAILED, message: err})
  }
}

// fires on FAO_FETCH_ALL_REQUESTED
function * fetchAllFAOs () {
  try {
    const dataDir = yield select(getDataDir)
    const faos = yield call(fileSystemApi.fetchAllFAOs, dataDir)
    yield put({type: actionTypes.FAO_FETCH_ALL_SUCCEEDED, faos})
  } catch (err) {
    yield put({type: actionTypes.FAO_FETCH_ALL_FAILED, message: err})
  }
}

// fires on PRODUCT_SAVE_ALL_REQUESTED
function * saveAllProducts () {
  try {
    const dataDir = yield select(getDataDir)
    // HACK: get all products from the store, these include the added/edited
    // products
    const prods = yield select(getProducts)
    // save them to the filesystem; get validated/fixed products back and put
    // them in the store; invalid products should then show up in the invalid
    // product view
    const products = yield call(fileSystemApi.saveAllProducts, [dataDir, prods])

    yield put({type: actionTypes.PRODUCT_SAVE_ALL_SUCCEEDED, products})
  } catch (err) {
    yield put({type: actionTypes.PRODUCT_SAVE_ALL_FAILED, message: err})
  }
}

// fires on PRODUCT_SAVE_ALL_REQUESTED
function * saveEditedProduct () {
  try {
    const dataDir = yield select(getDataDir)
    const editedProduct = yield select(getEditedProduct)
    yield call(fileSystemApi.saveEditedProduct, [dataDir, editedProduct])
    yield put({type: actionTypes.EDITED_PRODUCT_SAVE_SUCCEEDED})
  } catch (err) {
    yield put({type: actionTypes.EDITED_PRODUCT_SAVE_FAILED, message: err})
  }
}

export function * fetchProductsSaga () {
  yield takeLatest(actionTypes.PRODUCT_FETCH_ALL_REQUESTED, fetchAllProducts)
}

export function * fetchNutrientsSaga () {
  yield takeLatest(actionTypes.NUTRIENT_FETCH_ALL_REQUESTED, fetchAllNutrients)
}

export function * fetchFAOsSaga () {
  yield takeLatest(actionTypes.FAO_FETCH_ALL_REQUESTED, fetchAllFAOs)
}

export function * saveProductsSaga () {
  yield takeLatest(actionTypes.PRODUCT_SAVE_ALL_REQUESTED, saveAllProducts)
}

export function * saveEditedProductSaga () {
  yield takeLatest(
    actionTypes.EDITED_PRODUCT_SAVE_REQUESTED,
    saveEditedProduct
  )
}
