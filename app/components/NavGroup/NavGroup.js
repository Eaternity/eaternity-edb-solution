import React, { PropTypes } from 'react'
import { Button, ButtonGroup } from 'reactstrap'
import styles from './NavGroup.css'

const NavGroup = (props) => {
  const handleClick = (e) => {
    props.actions.toggleTableVisibility(e.target.id)
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
      </ButtonGroup>
    </div>
  )
}

NavGroup.propTypes = {
  actions: PropTypes.object.isRequired
}

export default NavGroup
