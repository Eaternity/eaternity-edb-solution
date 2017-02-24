import React, { PropTypes } from 'react'
import { Button, Col } from 'reactstrap'
import styles from './Edit.css'

const CustomArrayTemplate = props => {
  const { items, onAddClick } = props

  const processes = items.map((item, index) => {
    const { children, onDropIndexClick } = item
    return (
      <div key={index} className={styles.processContainer} >
        <div className={styles.process}>
          {children}
        </div>
        <div className={styles.processRemoveBtn}>
          <Button
            size='sm'
            outline
            color='warning'
            onClick={onDropIndexClick(index)}>
            Remove process
          </Button>
        </div>
      </div>
    )
  })

  return (
    <div className={styles.processesContainer} >
      {processes}
      <Col sm={{ size: 'auto', offset: 10 }}>
        <Button
          size='sm'
          outline
          color='success'
          onClick={onAddClick} >
        Add process
      </Button>
      </Col>
    </div>

  )
}

CustomArrayTemplate.propTypes = {
  items: PropTypes.string,
  canAdd: PropTypes.func.isRequired,
  onAddClick: PropTypes.func.isRequired
}

export default CustomArrayTemplate
