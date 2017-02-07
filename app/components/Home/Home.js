import React, { PropTypes } from 'react'
import SearchBar from '../SearchBar/SearchBar'
import NavGroup from '../NavGroup/NavGroup'
import ProductTable from '../ProductTable/ProductTable'
import FaoTable from '../FaoTable/FaoTable'
import NutrientTable from '../NutrientTable/NutrientTable'
import InvalidTable from '../InvalidTable/InvalidTable'
import styles from './Home.css'

const Home = props => {
  const renderTable = table => {
    switch (table) {
      case 'products':
        return <ProductTable
          actions={props.actions}
          products={props.products}
          searchInput={props.searchInput}
          searchFilter={props.searchFilter} />
      case 'fao':
        return <FaoTable
          actions={props.actions}
          faos={props.faos}
          searchInput={props.searchInput} />

      case 'nutrition':
        return <NutrientTable
          actions={props.actions}
          nutrients={props.nutrients}
          searchInput={props.searchInput} />

      case 'invalid':
        return <InvalidTable
          actions={props.actions}
          products={props.products}
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
  visibleTable: PropTypes.oneOf([
    'products',
    'fao',
    'nutrition',
    'invalid'
  ]).isRequired,
  searchInput: PropTypes.string.isRequired,
  searchFilter: PropTypes.array.isRequired
}

export default Home
