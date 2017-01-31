import React, { PropTypes } from 'react'
import { Table, Tr, Td } from 'reactable'
import { Button, Col, Container, Row } from 'reactstrap'
import DropArea from '../DropArea/DropArea'

const ProductTable = props => {
  const handleEditClick = (id) => {
    props.actions.selectProduct(id)
    props.actions.changeLocation(`/edit/${id}`)
  }

  const renderTableRows = () => {
    return (
      props.products.map(product => {
        return (
          <Tr key={product.id} >
            <Td column='Id' data={product.id} />
            <Td
              column='Name'
              data={`${product.name} ${product.specification}`} />
            <Td column='Synonyms' data={product.synonyms} />
            <Td column='Tags' data={product.tags} />
            <Td column='Co2-value' data={product['co2-value']} />
            <Td column='Actions'>
              <Button
                outline
                color='info'
                size='sm'
                onClick={() => handleEditClick(product.id)} >
                Edit
              </Button>
            </Td>
          </Tr>
        )
      })
    )
  }

  const renderView = () => {
    if (props.products.length === 0) {
      return (
        <div className='drop-container'>
          <DropArea actions={props.actions} />
        </div>
      )
    }

    return (
      <Table
        className='table'
        columns={['Id', 'Name', 'Synonyms', 'Tags', 'Co2-value', 'Actions']}
        itemsPerPage={8}
        pageButtonLimit={5}
        filterable={['Id', 'Name', 'Synonyms', 'Tags', 'Co2-value', 'Actions']}
        sortable={['Id', 'Name', 'Synonyms', 'Tags', 'Co2-value', 'Actions']}
        filterBy={props.searchInput}
        hideFilterInput >
        {renderTableRows()}
      </Table>
    )
  }

  return (
    <div className='table-container'>
      <Container>
        <Row>
          <Col sm={{ size: '10', offset: 1 }}>
            {renderView()}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

ProductTable.propTypes = {
  products: PropTypes.array,
  actions: PropTypes.object.isRequired,
  searchInput: PropTypes.string.isRequired
}

export default ProductTable
