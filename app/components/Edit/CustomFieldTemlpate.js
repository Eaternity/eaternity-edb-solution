import React, { PropTypes } from 'react'
import styles from './Edit.css'

const CustomFieldTemplate = props => {
  const {
    children,
    classNames,
    description,
    errors,
    rawErrors,
    id,
    label
  } = props
  const enhancedclassNames = `${classNames} ${rawErrors ? styles.error : ''}`

  return (
    <div className={enhancedclassNames}>
      <label htmlFor={id}>{label}</label>
      {description}
      {children}
      {errors}
    </div>
  )
}

CustomFieldTemplate.propTypes = {
  id: PropTypes.string.isRequired,
  classNames: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.object.isRequired,
  required: PropTypes.bool,
  children: PropTypes.object,
  errors: PropTypes.object,
  rawErrors: PropTypes.array
}

export default CustomFieldTemplate
