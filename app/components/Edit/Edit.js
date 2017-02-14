import React, { Component, PropTypes } from 'react'
import { Button, Card, CardBlock, CardTitle, CardSubtitle, Col } from 'reactstrap'
import Form from 'react-jsonschema-form'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import EditBar from '../EditBar/EditBar'
import productSchema from './prod.schema.json'
import styles from './Edit.css'

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
    backModalOpen: false
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

  render () {
    const log = type => console.log.bind(console, type)
    const { editedProduct } = this.props
    const uiSchema = {
      'delete': {
        'ui:widget': 'select'
      },
      'combined-product': {
        'ui:widget': 'select'
      }
    }

    return (
      <div>
        <EditBar
          actions={this.props.actions}
          filename={this.props.editedProduct.filename}
          saveModalOpen={this.state.saveModalOpen}
          backModalOpen={this.state.backModalOpen}
          toggleSaveModal={this.toggleSaveModal}
          toggleBackModal={this.toggleBackModal}
          handleSaveConfirmClick={this.handleSaveConfirmClick}
          handleBackConfirmClick={this.handleBackConfirmClick}
          handleSaveRejectClick={this.toggleSaveModal}
          handleBackRejectClick={this.toggleBackModal} />
        <div className={styles.container}>
          <Card>
            <CardBlock>
              <CardTitle>{this.props.editedProduct.name}</CardTitle>
              <CardSubtitle>{this.props.editedProduct.filename}</CardSubtitle>
            </CardBlock>
            <CardBlock>
              <Form
                schema={productSchema}
                uiSchema={uiSchema}
                formData={editedProduct}
                onChange={log('changed')}
                onSubmit={log('submitted')}
                onError={log('errors')} >
                <CardBlock>
                  <div className={styles.editBtnGroup}>
                    <Col sm={4}>
                      <Button
                        outline
                        color='warning'
                        onClick={() => this.toggleBackModal()}>
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
                        onClick={() => this.toggleSaveModal()}
                        outline
                        color='success'>
                        Save changes
                      </Button>
                      <ConfirmRejectModal
                        isOpen={this.state.saveModalOpen}
                        toggle={this.toggleSaveModal}
                        onConfirmClick={this.handleSaveConfirmClick}
                        onRejectClick={this.toggleSaveModal}
                        header='Saving will overwrite file!'
                        body={`Clicking save will overwrite ${this.props.editedProduct.filename}! Are you sure?`}
                        confirmBtnText='Save!'
                        rejectBtnText='Cancel'
                        />
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
