import React from 'react'
import * as dataActions from '../store/data/actions'
import * as viewActions from '../store/view/actions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { getVisibleProducts } from '../store/selectors/selector'
import Home from '../components/Home/Home'

const HomeContainer = props => {
  return (
    <Home {...props} />
  )
}

const mapStateToProps = state => {
  return {
    products: getVisibleProducts(state),
    faos: state.data.faos,
    nutrients: state.data.nutrients,
    dataDir: state.data.dataDir,
    editedProduct: state.data.editedProduct,
    searchInput: state.view.searchInput,
    searchFilter: state.view.searchFilter,
    visibleTable: state.view.visibleTable,
    orderedKeys: state.view.orderedKeys
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    fetchAllProducts: dataActions.fetchAllProducts,
    fetchAllFAOs: dataActions.fetchAllFAOs,
    fetchAllNutrients: dataActions.fetchAllNutrients,
    setDataDir: dataActions.setDataDir,
    selectProduct: dataActions.selectProduct,
    setEditedProductToNew: dataActions.setEditedProductToNew,
    toggleTableVisibility: viewActions.toggleTableVisibility,
    toggleProductVisibility: viewActions.toggleProductVisibility,
    updateSearchInput: viewActions.updateSearchInput,
    setSearchFilter: viewActions.setSearchFilter,
    clearSearchInput: viewActions.clearSearchInput,
    changeLocation: push
  }, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeContainer)
