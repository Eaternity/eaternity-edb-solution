import React from 'react'
import PropTypes from 'prop-types'
import {Table, Tr, Td} from 'reactable'
import {Button, Col, Container, Row} from 'reactstrap'
import DropArea from '../DropArea/DropArea'

const InvalidTable = props => {
  const handleEditClick = id => {
    const {selectProduct, changeLocation} = props.actions
    selectProduct(id)
    changeLocation(`/edit/${id}`)
  }

  const renderTableRows = () => {
    const {products} = props
    return products.map(prod => {
      const {id, name, brokenLinks, missingFields, validationErrors} = prod
      return (
        <Tr key={id}>
          <Td column='Id' data={id} />
          <Td column='Name' data={name} />
          <Td column='Broken Links' data={brokenLinks} />
          <Td column='Missing Fields' data={missingFields} />
          <Td column='Validation Errors' data={validationErrors} />
          <Td column='Actions'>
            <Button
              outline
              color='info'
              size='sm'
              onClick={() => handleEditClick(id)}
            >
              Fix product
            </Button>
          </Td>
        </Tr>
      )
    })
  }

  const renderView = () => {
    const {searchInput} = props

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
        columns={[
          'Id',
          'Name',
          'Broken Links',
          'Missing Fields',
          'Validation Errors',
          'Actions'
        ]}
        itemsPerPage={8}
        pageButtonLimit={5}
        filterable={[
          'Id',
          'Name',
          'Broken Links',
          'Missing Fields',
          'Validation Errors'
        ]}
        sortable={[
          'Id',
          'Name',
          'Broken Links',
          'Missing Fields',
          'Validation Errors'
        ]}
        filterBy={searchInput}
        hideFilterInput
      >
        {renderTableRows()}
      </Table>
    )
  }

  return (
    <div className='table-container'>
      <Container>
        <Row>
          <Col sm={{size: '10', offset: 1}}>
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
