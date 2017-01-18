import { call, put, takeLatest } from 'redux-saga/effects'
import edbApi from '../../api/edb'
import * as actionTypes from '../data/action-types'

function * fetchAllFAOs () {
  try {
    const faos = yield call(edbApi.fetchAllFAOs)
    yield put({type: actionTypes.FAO_FETCH_ALL_SUCCEEDED, faos})
  } catch (err) {
    yield put({type: actionTypes.FAO_FETCH_ALL_FAILED, message: err.message})
  }
}

export function * fetchFAOsSaga () {
  yield takeLatest(actionTypes.FAO_FETCH_ALL_REQUESTED, fetchAllFAOs)
}
