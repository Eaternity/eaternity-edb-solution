import React, { PropTypes } from 'react'
// import x from './x.png'
import styles from './Chip.css'

const Chip = props => {
  const { value, id, handleRemoveClick } = props

  return (
    <div
      className={styles.chip} >
      {value}
      <button
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
