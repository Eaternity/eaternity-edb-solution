import { call, put, takeLatest } from 'redux-saga/effects'
import fileSystemApi from '../../filesystem-api/filesystem-api'
import * as actionTypes from '../data/action-types'

function * fetchAllNutrients () {
  try {
    const nutrients = yield call(fileSystemApi.fetchAllNutrients)
    yield put({type: actionTypes.NUTRIENT_FETCH_ALL_SUCCEEDED, nutrients})
  } catch (err) {
    yield put({type: actionTypes.NUTRIENT_FETCH_ALL_FAILED, message: err.message})
  }
}

export function * fetchNutrientsSaga () {
  yield takeLatest(actionTypes.NUTRIENT_FETCH_ALL_REQUESTED, fetchAllNutrients)
}
