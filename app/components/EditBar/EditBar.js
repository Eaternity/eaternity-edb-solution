import React, { PropTypes } from 'react'
import { Button, Nav, Navbar, NavbarBrand } from 'reactstrap'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import logo from './logo.png'
import styles from './EditBar.css'

const EditBar = props => {
  console.log(props.toggleBackModal)
  return (
    <Navbar color='faded' light>
      <NavbarBrand>
        <img className={styles.logo} src={logo} alt='logo' />
      </NavbarBrand>
      <Nav className='float-xs-right' navbar>
        <Button
          outline
          color='warning'
          onClick={() => props.toggleBackModal()}>
          Back
        </Button>
        <ConfirmRejectModal
          isOpen={props.backModalOpen}
          toggle={props.toggleBackModal}
          onConfirmClick={props.handleBackConfirmClick}
          onRejectClick={props.handleBackRejectClick}
          header='Did you save your changes?'
          body={'Changes will be lost when you go back to the table view without saving!'}
          confirmBtnText='Back to table view'
          rejectBtnText='Cancel' />{' '}
        <Button
          outline
          color='success'
          onClick={() => props.toggleSaveModal()}>
          Save
        </Button>
        <ConfirmRejectModal
          isOpen={props.saveModalOpen}
          toggle={props.toggleSaveModal}
          onConfirmClick={props.handleSaveConfirmClick}
          onRejectClick={props.handleSaveRejectClick}
          header='Warning'
          body={`Clicking save will overwrite ${props.filename}! Are you sure?`}
          confirmBtnText='Save'
          rejectBtnText='Cancel' />
      </Nav>
    </Navbar>
  )
}

EditBar.propTypes = {
  saveModalOpen: PropTypes.bool.isRequired,
  backModalOpen: PropTypes.bool.isRequired,
  toggleSaveModal: PropTypes.func.isRequired,
  toggleBackModal: PropTypes.func.isRequired,
  handleSaveConfirmClick: PropTypes.func.isRequired,
  handleSaveRejectClick: PropTypes.func.isRequired,
  handleBackConfirmClick: PropTypes.func.isRequired,
  handleBackRejectClick: PropTypes.func.isRequired,
  filename: PropTypes.string
}

export default EditBar
