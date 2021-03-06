import React from 'react'
import PropTypes from 'prop-types'
import {clipboard} from 'electron'
import {Table, Tr, Td} from 'reactable'
import {Button, Col, Container, Row} from 'reactstrap'
import DropArea from '../DropArea/DropArea'

const NutrientTable = props => {
  const {actions, nutrients, searchInput} = props

  const handleCopyClick = id => {
    clipboard.writeText(id.toString())
  }

  const renderTableRows = () =>
    nutrients.map(nutrient => (
      <Tr key={nutrient.id}>
        <Td column='Id' data={nutrient.id} />
        <Td column='Name' data={nutrient.name} />
        <Td column='Country' data={nutrient.country} />
        <Td column='Actions'>
          <Button
            outline
            color='info'
            size='sm'
            onClick={() => handleCopyClick(nutrient.id)}
          >
            Copy ID
          </Button>
        </Td>
      </Tr>
    ))

  const renderView = () =>
    (nutrients.length === 0
      ? <div className='drop-container'>
        <DropArea actions={actions} />
      </div>
      : <Table
        className='table'
        columns={['Id', 'Name', 'Country', 'Actions']}
        itemsPerPage={8}
        pageButtonLimit={5}
        filterable={['Id', 'Name', 'Country']}
        sortable={['Id', 'Name', 'Country']}
        filterBy={searchInput}
        hideFilterInput
        >
        {renderTableRows()}
      </Table>)

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

NutrientTable.propTypes = {
  nutrients: PropTypes.array,
  searchInput: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired
}

export default NutrientTable
