import { call, put, select, takeLatest } from 'redux-saga/effects'
import { getDataDir } from '../selectors/product'
import fileSystemApi from '../../filesystem-api/filesystem-api'
import * as actionTypes from '../data/action-types'

// worker sagas...

// fires on PRODUCT_FETCH_ALL_REQUESTED
function * fetchAllProducts () {
  try {
    const dataDir = yield select(getDataDir)
    const products = yield call(fileSystemApi.fetchAllProducts, dataDir)
    yield put({type: actionTypes.PRODUCT_FETCH_ALL_SUCCEEDED, products})
  } catch (err) {
    yield put({type: actionTypes.PRODUCT_FETCH_ALL_FAILED, message: err.message})
  }
}

// fires on NUTRIENTS_FETCH_ALL_REQUESTED
function * fetchAllNutrients () {
  try {
    const dataDir = yield select(getDataDir)
    const nutrients = yield call(fileSystemApi.fetchAllNutrients, dataDir)
    yield put({type: actionTypes.NUTRIENT_FETCH_ALL_SUCCEEDED, nutrients})
  } catch (err) {
    yield put({type: actionTypes.NUTRIENT_FETCH_ALL_FAILED, message: err.message})
  }
}

// fires on FAO_FETCH_ALL_REQUESTED
function * fetchAllFAOs () {
  try {
    const dataDir = yield select(getDataDir)
    const faos = yield call(fileSystemApi.fetchAllFAOs, dataDir)
    yield put({type: actionTypes.FAO_FETCH_ALL_SUCCEEDED, faos})
  } catch (err) {
    yield put({type: actionTypes.FAO_FETCH_ALL_FAILED, message: err.message})
  }
}

// sagas
export function * fetchProductsSaga () {
  yield takeLatest(actionTypes.PRODUCT_FETCH_ALL_REQUESTED, fetchAllProducts)
}

export function * fetchNutrientsSaga () {
  yield takeLatest(actionTypes.NUTRIENT_FETCH_ALL_REQUESTED, fetchAllNutrients)
}

export function * fetchFAOsSaga () {
  yield takeLatest(actionTypes.FAO_FETCH_ALL_REQUESTED, fetchAllFAOs)
}
