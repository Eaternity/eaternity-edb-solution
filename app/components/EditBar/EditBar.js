import React from 'react'
import PropTypes from 'prop-types'
import { Button, Nav, Navbar, NavbarBrand } from 'reactstrap'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import logo from './logo.png'
import styles from './EditBar.css'

const EditBar = props => {
  const { backModalOpen, toggleBackModal, handleBackConfirmClick } = props

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
          rejectBtnText='Cancel' />
      </Nav>
    </Navbar>
  )
}

EditBar.propTypes = {
  backModalOpen: PropTypes.bool.isRequired,
  toggleBackModal: PropTypes.func.isRequired,
  handleBackConfirmClick: PropTypes.func.isRequired
}

export default EditBar
