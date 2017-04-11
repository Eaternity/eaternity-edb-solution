import React from 'react'
import PropTypes from 'prop-types'
import { clipboard } from 'electron'
import { Table, Tr, Td } from 'reactable'
import { Button, Col, Container, Row } from 'reactstrap'
import DropArea from '../DropArea/DropArea'

const FaoTable = (props: Object) => {
  const handleCopyClick = (id) => {
    clipboard.writeText(id.toString())
  }

  const renderTableRows = () => {
    return (
      props.faos.map(fao => {
        return (
          <Tr key={fao['fao-code']} >
            <Td column='Code' data={fao['fao-code']} />
            <Td column='Name' data={fao['fao-name']} />
            <Td column='Definition' data={fao.definition} />
            <Td column='Actions'>
              <Button
                outline
                color='info'
                size='sm'
                onClick={() => handleCopyClick(fao['fao-code'])} >
                Copy FAO code
              </Button>
            </Td>
          </Tr>
        )
      })
    )
  }

  const renderView = () => {
    if (props.faos.length === 0) {
      return (
        <div className='drop-container'>
          <DropArea actions={props.actions} />
        </div>
      )
    }

    return (
      <Table
        className='table'
        columns={['Code', 'Name', 'Definition', 'Actions']}
        itemsPerPage={5}
        pageButtonLimit={5}
        filterable={['Code', 'Name', 'Definition']}
        sortable={['Code', 'Name', 'Definition']}
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

FaoTable.propTypes = {
  faos: PropTypes.array,
  searchInput: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired
}

export default FaoTable
