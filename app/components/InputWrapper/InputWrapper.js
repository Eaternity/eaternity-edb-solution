import React from 'react'
import PropTypes from 'prop-types'
import { FormGroup, Label, Col } from 'reactstrap'

const InputWrapper = props => {
  const { fieldName } = props
  return (
    <FormGroup key={fieldName} row>
      <Label for={fieldName} sm={4}>
        {fieldName}
      </Label>
      <Col sm={8}>
        {props.children}
      </Col>
    </FormGroup>
  )
}

InputWrapper.propTypes = {
  fieldName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

export default InputWrapper
