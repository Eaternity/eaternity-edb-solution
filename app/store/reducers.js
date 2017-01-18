/* @flow */
import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'
import data from './data/reducer'
import view from './view/reducer'

const rootReducer = combineReducers({
  routing,
  data,
  view
})

export default rootReducer
