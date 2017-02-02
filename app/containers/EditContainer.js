import React from 'react'
import * as dataActions from '../store/data/actions'
import * as viewActions from '../store/view/actions'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'
import Edit from '../components/Edit/Edit'

const EditContainer = props => {
  return (
    <Edit {...props} />
  )
}

const mapStateToProps = state => ({
  dataDir: state.data.dataDir,
  products: state.data.products,
  editedProduct: state.data.editedProduct,
  orderedKeys: state.view.orderedKeys
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    updateEditedProduct: dataActions.updateEditedProduct,
    mergeEditedToProducts: dataActions.mergeEditedToProducts,
    saveAllProducts: dataActions.saveAllProducts,
    clearSearchInput: viewActions.clearSearchInput,
    changeLocation: push
  }, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContainer)
