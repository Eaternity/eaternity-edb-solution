import React, { PropTypes } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

const ConfirmRejectModal = props => {
  const {
    header,
    body,
    isOpen,
    toggle,
    confirmBtnText,
    rejectBtnText,
    onConfirmClick,
    onRejectClick
  } = props
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle} >
      <ModalHeader>
        {header}
      </ModalHeader>
      <ModalBody>
        {body}
      </ModalBody>
      <ModalFooter>
        <Button
          color='success'
          outline
          onClick={() => onConfirmClick()}>
          {confirmBtnText}
        </Button>{' '}
        <Button
          color='warning'
          outline
          onClick={() => onRejectClick()}>
          {rejectBtnText}
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
  onRejectClick: PropTypes.func.isRequired
}

export default ConfirmRejectModal
