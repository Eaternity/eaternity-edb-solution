import React, { PropTypes } from 'react'
import { Table, Tr, Td } from 'reactable'
import { Button, Col, Container, Row } from 'reactstrap'
import DropArea from '../DropArea/DropArea'

const InvalidTable = props => {
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
            <Td column='Name' data={product.name} />
            <Td column='Broken Links' data={product.brokenLinks} />
            <Td column='Missing Fields' data={product.missingFields} />
            <Td column='Actions'>
              <Button
                outline
                color='info'
                size='sm'
                onClick={() => handleEditClick(product.id)} >
                Fix product
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
        columns={['Id', 'Name', 'Broken Links', 'Missing Fields', 'Actions']}
        itemsPerPage={8}
        pageButtonLimit={5}
        filterable={['Id', 'Name', 'Broken Links', 'Missing Fields']}
        sortable={['Id', 'Name', 'Broken Links', 'Missing Fields']}
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

InvalidTable.propTypes = {
  products: PropTypes.array,
  searchInput: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired
}

export default InvalidTable
