import React, { PropTypes } from 'react'
import styles from './Chip.css'

const Chip = props => {
  const { value, id, handleRemoveClick } = props

  return (
    <div
      className={styles.chip} >
      {value}
      <button
        className={styles.chipButton}
        id={id}
        type='button'
        onClick={(e) => handleRemoveClick(e)}>
        X
      </button>
    </div>
  )
}

Chip.propTypes = {
  value: PropTypes.string,
  id: PropTypes.string,
  handleRemoveClick: PropTypes.func.isRequired
}

export default Chip
