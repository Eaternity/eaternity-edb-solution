import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col } from 'reactstrap'
import styles from './Edit.css'

const CustomArrayTemplate = props => {
  const { items, onAddClick } = props

  const arrayItems = items.map((item, index) => {
    const { children, onDropIndexClick } = item
    return (
      <div key={index} className={styles.itemContainer} >
        <div className={styles.item}>
          {children}
        </div>
        <div className={styles.itemRemoveBtn}>
          <Button
            size='sm'
            outline
            color='warning'
            onClick={onDropIndexClick(index)}>
            Remove item
          </Button>
        </div>
      </div>
    )
  })

  return (
    <div className={styles.arrayContainer} >
      {arrayItems}
      <Col sm={{ size: 'auto', offset: 10 }}>
        <Button
          size='sm'
          outline
          color='success'
          onClick={onAddClick} >
        Add item
      </Button>
      </Col>
    </div>

  )
}

CustomArrayTemplate.propTypes = {
  items: PropTypes.string,
  onAddClick: PropTypes.func.isRequired
}

export default CustomArrayTemplate
