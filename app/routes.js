// @flow
import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App/App'
import HomeContainer from './containers/HomeContainer'
import EditContainer from './containers/EditContainer'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={HomeContainer} />
    <Route path='/edit/:id' component={EditContainer} />
  </Route>
)
