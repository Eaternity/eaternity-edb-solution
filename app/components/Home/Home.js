import React from 'react'
import PropTypes from 'prop-types'
import SearchBar from '../SearchBar/SearchBar'
import NavGroup from '../NavGroup/NavGroup'
import ProductTable from '../ProductTable/ProductTable'
import FaoTable from '../FaoTable/FaoTable'
import NutrientTable from '../NutrientTable/NutrientTable'
import InvalidTable from '../InvalidTable/InvalidTable'
import styles from './Home.css'

const Home = props => {
  const {
    actions,
    dataDir,
    editedProduct,
    visibleTable,
    products,
    nutrients,
    faos,
    searchInput,
    searchFilter
  } = props

  const renderTable = table => {
    switch (table) {
      case 'products':
        return <ProductTable
          actions={actions}
          products={products}
          searchInput={searchInput}
          searchFilter={searchFilter} />
      case 'fao':
        return <FaoTable
          actions={actions}
          faos={faos}
          searchInput={searchInput} />

      case 'nutrition':
        return <NutrientTable
          actions={actions}
          nutrients={nutrients}
          searchInput={searchInput} />

      case 'invalid':
        return <InvalidTable
          actions={actions}
          products={products}
          searchInput={searchInput} />

      default:
        return <h1>Default case should not exist! Check Home.js</h1>
    }
  }

  return (
    <div className={styles.container}>
      <SearchBar
        dataDir={dataDir}
        editedProduct={editedProduct}
        actions={actions} />
      <NavGroup
        actions={actions} />
      {renderTable(visibleTable)}
    </div>
  )
}

Home.propTypes = {
  products: PropTypes.array.isRequired,
  editedProduct: PropTypes.object.isRequired,
  productType: PropTypes.string.isRequired,
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
