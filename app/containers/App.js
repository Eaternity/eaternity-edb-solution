// @flow
import React, { PropTypes } from 'react'

const App = (props: Object) => {
  return (
    <div>
      {props.children}
    </div>
  )
}

App.propTypes = {
  children: PropTypes.element.isRequired
}

export default App
