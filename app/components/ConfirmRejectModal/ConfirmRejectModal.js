/* @flux */
import React, { PropTypes } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

const ConfirmRejectModal = (props: Object) => {
  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.toggle} >
      <ModalHeader
        toggle={props.toggle}>
        {props.header}
      </ModalHeader>
      <ModalBody>
        {props.body}
      </ModalBody>
      <ModalFooter>
        <Button
          color='success'
          outline
          onClick={() => props.onConfirmClick()}>
          {props.confirmBtnText}
        </Button>{' '}
        <Button
          color='warning'
          outline
          onClick={() => props.onRejectClick()}>
          {props.rejectBtnText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

ConfirmRejectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  header: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  confirmBtnText: PropTypes.string.isRequired,
  rejectBtnText: PropTypes.string.isRequired,
  onConfirmClick: PropTypes.func.isRequired,
  onRejectClick: PropTypes.func.isRequired,
}

export default ConfirmRejectModal
