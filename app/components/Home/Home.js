/* @flow */
import React, { PropTypes } from 'react'
import SearchBar from '../SearchBar/SearchBar'
import NavGroup from '../NavGroup/NavGroup'
import ProductTable from '../ProductTable/ProductTable'
import FaoTable from '../FaoTable/FaoTable'
import NutrientTable from '../NutrientTable/NutrientTable'
import styles from './Home.css'

const Home = (props: Object) => {
  const renderTable = (table) => {
    switch (table) {
      case 'products':
        return <ProductTable
          actions={props.actions}
          products={props.products}
          searchInput={props.searchInput} />

      case 'fao':
        return <FaoTable
          changeDataDir={props.actions.changeDataDir}
          faos={props.faos}
          searchInput={props.searchInput} />

      case 'nutrition':
        return <NutrientTable
          changeDataDir={props.actions.changeDataDir}
          nutrients={props.nutrients}
          searchInput={props.searchInput} />

      default:
        return <h1>Default case should not exist! Check Home.js</h1>
    }
  }

  return (
    <div className={styles.container}>
      <SearchBar
        dataDir={props.dataDir}
        editedProduct={props.editedProduct}
        actions={props.actions} />
      <NavGroup
        actions={props.actions} />
      {renderTable(props.visibleTable)}
    </div>
  )
}

Home.propTypes = {
  products: PropTypes.array.isRequired,
  editedProduct: PropTypes.object.isRequired,
  dataDir: PropTypes.string.isRequired,
  faos: PropTypes.array.isRequired,
  nutrients: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  visibleTable: PropTypes.oneOf(['products', 'fao', 'nutrition']).isRequired,
  searchInput: PropTypes.string.isRequired
}

export default Home
