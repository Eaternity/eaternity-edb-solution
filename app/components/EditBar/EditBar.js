import React, { PropTypes } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Nav, Navbar, NavbarBrand } from 'reactstrap'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import logo from './logo.png'
import styles from './EditBar.css'

const EditBar = props => {
  const {
    filename,
    errorMessages,
    saveModalOpen,
    backModalOpen,
    errorModalOpen,
    toggleSaveModal,
    toggleBackModal,
    toggleErrorModal,
    handleSaveConfirmClick,
    handleBackConfirmClick
  } = props

  const hasErrors = errorMessages.length > 0

  return (
    <Navbar color='faded' light>
      <NavbarBrand>
        <img className={styles.logo} src={logo} alt='logo' />
      </NavbarBrand>
      <Nav className='float-xs-right' navbar>
        <Button
          outline
          color='warning'
          onClick={toggleBackModal}>
          Back
        </Button>
        <ConfirmRejectModal
          isOpen={backModalOpen}
          toggle={toggleBackModal}
          onConfirmClick={handleBackConfirmClick}
          onRejectClick={toggleBackModal}
          header='Did you save your changes?'
          body={'Changes will be lost when you go back to the table view without saving!'}
          confirmBtnText='Back to table view'
          rejectBtnText='Cancel' />{' '}
        <Button
          onClick={hasErrors ? toggleErrorModal : toggleSaveModal}
          outline
          color='success'>
            Save
          </Button>
        {hasErrors
            ? <Modal
              isOpen={errorModalOpen}
              toggle={toggleErrorModal} >
              <ModalHeader
                toggle={toggleErrorModal} >
                {'Cannot save product. Form contains errors:'}
              </ModalHeader>
              <ModalBody>
                {errorMessages}
              </ModalBody>
              <ModalFooter>
                <Button
                  color='success'
                  onClick={toggleErrorModal} >
                  Fix Errors
                </Button>
              </ModalFooter>
            </Modal>
          : <ConfirmRejectModal
            isOpen={saveModalOpen}
            toggle={toggleSaveModal}
            onConfirmClick={handleSaveConfirmClick}
            onRejectClick={toggleSaveModal}
            header='Saving will overwrite file!'
            body={`Clicking save will overwrite ${filename}! Are you sure?`}
            confirmBtnText='Save!'
            rejectBtnText='Cancel'
            />
          }
      </Nav>
    </Navbar>
  )
}

EditBar.propTypes = {
  errorMessages: PropTypes.node.isRequired,
  saveModalOpen: PropTypes.bool.isRequired,
  backModalOpen: PropTypes.bool.isRequired,
  errorModalOpen: PropTypes.bool.isRequired,
  toggleSaveModal: PropTypes.func.isRequired,
  toggleBackModal: PropTypes.func.isRequired,
  toggleErrorModal: PropTypes.func.isRequired,
  handleSaveConfirmClick: PropTypes.func.isRequired,
  handleBackConfirmClick: PropTypes.func.isRequired,
  filename: PropTypes.string
}

export default EditBar
