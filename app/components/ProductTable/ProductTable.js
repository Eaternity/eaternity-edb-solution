/* @flow */
import React, { PropTypes } from 'react'
import { Table, Tr, Td } from 'reactable'
import { Button, Col, Container, Row } from 'reactstrap'
import DropArea from '../DropArea/DropArea'

const ProductTable = (props: Object) => {
  const handleEditClick = (id) => {
    props.actions.selectProduct(id)
    props.actions.changeLocation(`/edit/${id}`)
  }

  const renderTableRows = () => {
    return (
      props.products.map(product => {
        return (
          <Tr key={product.Id} >
            <Td column='Product' data={product.Product} />
            <Td column='Tags' data={product.Tags} />
            <Td column='Co2-value' data={product['Co2-value']} />
            <Td column='Actions'>
              <Button
                outline
                color='info'
                size='sm'
                onClick={() => handleEditClick(product.Id)} >
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
        columns={['Product', 'Tags', 'Co2-value', 'Actions']}
        itemsPerPage={8}
        pageButtonLimit={5}
        filterable={['Product', 'Tags', 'Co2-value']}
        sortable={['Product', 'Tags', 'Co2-value']}
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
