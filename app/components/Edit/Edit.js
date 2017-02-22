import React, { Component, PropTypes } from 'react'
import {
  Button,
  Card,
  CardBlock,
  CardTitle,
  CardSubtitle,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap'
import Form from 'react-jsonschema-form'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import CustomFieldTemplate from './CustomFieldTemlpate'
import CustomArrayTemplate from './CustomArrayTemplate'
import SynonymsField from './SynonymsField'
import EditBar from '../EditBar/EditBar'
import productSchema from './prod.schema.json'
import uiSchema from './uiSchema'
import styles from './Edit.css'

class Edit extends Component {
  static propTypes = {
    dataDir: PropTypes.string.isRequired,
    editedProduct: PropTypes.object.isRequired,
    products: PropTypes.array.isRequired,
    nutrients: PropTypes.array.isRequired,
    faos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    saveModalOpen: false,
    backModalOpen: false,
    errorModalOpen: false,
    formData: {},
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
    const {
      updateEditedProduct,
      mergeEditedToProducts,
      saveAllProducts
    } = this.props.actions

    updateEditedProduct({
      editedProduct: this.state.formData
    })
    mergeEditedToProducts()
    saveAllProducts()
    this.toggleSaveModal()
  }

  handleBackConfirmClick = () => {
    this.props.actions.setProductType('old')
    this.props.actions.clearSearchInput()
    this.props.actions.changeLocation('/')
    this.toggleBackModal()
  }

  handleError = errors => {
    const errorMessages = errors
      .map(error => {
        return (
          <p key={error.stack}>
            {error.stack.split('.')[1]}
          </p>
        )
      })

    this.setState({
      errorMessages
    })

    this.toggleErrorModal()
  }

  handleSubmit = ({formData}) => {
    // the formData object passed to handleSubmit does never have any
    // errors??!! This means invalid values get removed!
    this.setState({
      formData
    })

    this.toggleSaveModal()
  }

  render () {
    const { editedProduct, products, nutrients, faos } = this.props
    const fields = {
      synonyms: SynonymsField
    }
    // the formContext object is consumed by the Oracle/Autosuggest
    const formContext = {
      allData: {
        products,
        nutrients,
        faos
      }
    }

    return (
      <div>
        <EditBar
          actions={this.props.actions}
          backModalOpen={this.state.backModalOpen}
          toggleBackModal={this.toggleBackModal}
          handleBackConfirmClick={this.handleBackConfirmClick} />
        <div className={styles.container}>
          <Card>
            <CardBlock>
              <CardTitle>{editedProduct.name}</CardTitle>
              <CardSubtitle>{editedProduct.filename}</CardSubtitle>
            </CardBlock>
            <CardBlock>
              <Form
                schema={productSchema}
                uiSchema={uiSchema}
                formData={editedProduct}
                formContext={formContext}
                FieldTemplate={CustomFieldTemplate}
                ArrayFieldTemplate={CustomArrayTemplate}
                showErrorList={false}
                liveValidate
                onError={this.handleError}
                onSubmit={this.handleSubmit}
                fields={fields} >
                <p>* required field </p>
                <CardBlock>
                  <div className={styles.editBtnGroup}>
                    <Col sm={5}>
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
                        type='submit'
                        outline
                        color='success'>
                        Save changes
                      </Button>
                      <Modal
                        isOpen={this.state.errorModalOpen}
                        toggle={this.toggleErrorModal} >
                        <ModalHeader
                          toggle={this.toggleErrorModal} >
                          {'Cannot save product. Form contains errors:'}
                        </ModalHeader>
                        <ModalBody
                          className={styles.errorModalText} >
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
                      <ConfirmRejectModal
                        isOpen={this.state.saveModalOpen}
                        toggle={this.toggleSaveModal}
                        onConfirmClick={this.handleSaveConfirmClick}
                        onRejectClick={this.toggleSaveModal}
                        header='Saving will overwrite file!'
                        body={`Clicking save will overwrite ${editedProduct.filename}! Are you sure?`}
                        confirmBtnText='Save!'
                        rejectBtnText='Cancel' />
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
