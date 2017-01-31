import React, { PropTypes } from 'react'
import { Button, ButtonGroup } from 'reactstrap'
import styles from './NavGroup.css'

const NavGroup = props => {
  const handleClick = event => {
    const tableType = event.target.id
    if (tableType === 'invalid') {
      props.actions.toggleProductVisibility('SHOW_INVALID')
    } else {
      props.actions.toggleProductVisibility('SHOW_SUBSET')
    }
    props.actions.toggleTableVisibility(tableType)
    props.actions.clearSearchInput()
  }

  return (
    <div className={styles.container}>
      <ButtonGroup>
        <Button
          onClick={(e) => handleClick(e)}
          id='products'
          outline
          color='info'
          size='sm' >
          Products
        </Button>{' '}
        <Button
          onClick={(e) => handleClick(e)}
          id='fao'
          outline
          color='info'
          size='sm' >
          FAO
        </Button>{' '}
        <Button
          onClick={(e) => handleClick(e)}
          id='nutrition'
          outline
          color='info'
          size='sm' >
          Nutrition
        </Button>{' '}
        <Button
          onClick={(e) => handleClick(e)}
          id='invalid'
          outline
          color='warning'
          size='sm' >
        Invalid products
      </Button>
      </ButtonGroup>{' '}
    </div>
  )
}

NavGroup.propTypes = {
  actions: PropTypes.object.isRequired
}

export default NavGroup
