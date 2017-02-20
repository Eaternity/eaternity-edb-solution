import React, { PropTypes } from 'react'
import styles from './Edit.css'

const CustomFieldTemplate = props => {
  const { children, classNames, errors, rawErrors, id, label, required } = props
  const enhancedclassNames = `${classNames} ${rawErrors ? styles.error : ''}`

  return (
    <div className={enhancedclassNames}>
      <label htmlFor={id}>{label}{required ? '*' : null}</label>
      {children}
      {errors}
    </div>
  )
}

CustomFieldTemplate.propTypes = {
  id: PropTypes.string,
  classNames: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.object,
  errors: PropTypes.object,
  rawErrors: PropTypes.array
}

export default CustomFieldTemplate
