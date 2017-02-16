import React, { Component, PropTypes } from 'react'
import { Button, Card, CardBlock, CardTitle, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Form from 'react-jsonschema-form'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import EditBar from '../EditBar/EditBar'
import productSchema from './productSchema.json'
import uiSchema from './uiSchema'
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
  rawErrors: PropTypes.array,
}

class Edit extends Component {
  static propTypes = {
    dataDir: PropTypes.string.isRequired,
    editedProduct: PropTypes.object.isRequired,
    orderedKeys: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    faos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    saveModalOpen: false,
    backModalOpen: false,
    errorModalOpen: false,
    errorMessages: []
  }

  toggleErrorModal = () => {
    this.setState({
      errorModalOpen: !this.state.errorModalOpen
    })
  }

  toggleSaveModal = () => {
    this.setState({
      saveModalOpen: !this.state.saveModalOpen
    })
  }

  toggleBackModal = () => {
    this.setState({
      backModalOpen: !this.state.backModalOpen
    })
  }

  handleSaveConfirmClick = () => {
    // this.props.actions.setProductType('old')
    this.props.actions.mergeEditedToProducts()
    this.props.actions.saveAllProducts()
    this.toggleSaveModal()
  }

  handleBackConfirmClick = () => {
    this.props.actions.setProductType('old')
    this.props.actions.clearSearchInput()
    this.props.actions.changeLocation('/')
    this.toggleBackModal()
  }

  handleInputChange = ({ formData, errors }) => {
    const errorMessages = errors
      .map(error => {
        return (
          <p key={error.stack}>
            {error.stack}
          </p>
        )
      })

    this.setState({
      errorMessages
    })

    this.props.actions.updateEditedProduct({
      editedProduct: formData
    })
  }

  handleSubmit = ({formData}) => {
    this.props.actions.updateEditedProduct({
      editedProduct: formData
    })
  }

  render () {
    const { editedProduct } = this.props
    const hasErrors = this.state.errorMessages.length > 0

    return (
      <div>
        <EditBar
          {...this.state}
          actions={this.props.actions}
          filename={this.props.editedProduct.filename}
          toggleSaveModal={this.toggleSaveModal}
          toggleBackModal={this.toggleBackModal}
          toggleErrorModal={this.toggleErrorModal}
          handleSaveConfirmClick={this.handleSaveConfirmClick}
          handleBackConfirmClick={this.handleBackConfirmClick} />
        <div className={styles.container}>
          <Card>
            <CardBlock>
              <CardTitle>{this.props.editedProduct.name}</CardTitle>
            </CardBlock>
            <CardBlock>
              <Form
                schema={productSchema}
                uiSchema={uiSchema}
                FieldTemplate={CustomFieldTemplate}
                formData={editedProduct}
                liveValidate
                onChange={this.handleInputChange}
                onSubmit={this.handleSubmit} >
                <p>* required field </p>
                <CardBlock>
                  <div className={styles.editBtnGroup}>
                    <Col sm={4}>
                      <Button
                        type='button'
                        outline
                        color='warning'
                        onClick={this.toggleBackModal}>
                        Back
                      </Button>
                      <ConfirmRejectModal
                        isOpen={this.state.backModalOpen}
                        toggle={this.toggleBackModal}
                        onConfirmClick={this.handleBackConfirmClick}
                        onRejectClick={this.toggleBackModal}
                        header='Did you save your changes?'
                        body={'Changes will be lost when you go back to the table view without saving!'}
                        confirmBtnText='Back to table view'
                        rejectBtnText='Cancel' />{' '}
                      <Button
                        type='button'
                        onClick={hasErrors ? this.toggleErrorModal
                          : this.toggleSaveModal}
                        outline
                        color='success'>
                        Save changes
                      </Button>
                      {hasErrors
                        ? <Modal
                          isOpen={this.state.errorModalOpen}
                          toggle={this.toggleErrorModal} >
                          <ModalHeader
                            toggle={this.toggleErrorModal} >
                            {'Cannot save product. Form contains errors:'}
                          </ModalHeader>
                          <ModalBody>
                            {this.state.errorMessages}
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              color='success'
                              onClick={this.toggleErrorModal} >
                              Fix Errors
                            </Button>
                          </ModalFooter>
                        </Modal>
                      : <ConfirmRejectModal
                        isOpen={this.saveModalOpen}
                        toggle={this.toggleSaveModal}
                        onConfirmClick={this.handleSaveConfirmClick}
                        onRejectClick={this.toggleSaveModal}
                        header='Saving will overwrite file!'
                        body={`Clicking save will overwrite ${this.props.editedProduct.filename}! Are you sure?`}
                        confirmBtnText='Save!'
                        rejectBtnText='Cancel'
                        />
                      }
                    </Col>
                  </div>
                </CardBlock>
              </Form>
            </CardBlock>
          </Card>
        </div>
      </div>
    )
  }
}

export default Edit
