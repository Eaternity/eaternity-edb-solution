import React, { Component, PropTypes } from 'react'
import { Button, Card, CardBlock, CardTitle, CardSubtitle, Col, Form, Input } from 'reactstrap'
import ChipInput from 'material-ui-chip-input'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import EditBar from '../EditBar/EditBar'
import InputWrapper from '../InputWrapper/InputWrapper'
import Oracle from '../Oracle/Oracle'
import styles from './Edit.css'

class Edit extends Component {
  static propTypes = {
    dataDir: PropTypes.string.isRequired,
    editedProduct: PropTypes.object.isRequired,
    productType: PropTypes.string.isRequired,
    orderedKeys: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    faos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    saveModalOpen: false,
    backModalOpen: false
  }

  // componentWillUpdate = (nextProps, nextState) => {
  //   //TODO: The component should/ will update when edited productgets saved
  //   // and validation adds new fields from linked-id...
  //
  // }

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

  togglePopover = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen
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

  handleInputChange = event => {
    this.props.actions.updateEditedProduct(event.target.id, event.target.value)
  }

  handleSynonymChange = synonyms => {
    this.props.actions.updateEditedProduct('synonyms', synonyms)
  }

  renderInputs = () => {
    const { products, faos, editedProduct, productType, orderedKeys } =
      this.props

    return orderedKeys
      .map(key => {
        const value = editedProduct[key]
        const defaultInput = (
          <InputWrapper key={String(key)} fieldName={key}>
            <Input
              type='text'
              id={key}
              onChange={this.handleInputChange}
              value={value || ''} />
          </InputWrapper>
        )
        const readOnlyInput = (
          <InputWrapper key={String(key)} fieldName={key}>
            <Input
              type='text'
              id={key}
              readOnly
              value={value || ''} />
          </InputWrapper>
        )

        switch (key) {
          case 'id':
            return readOnlyInput

          case 'name':
            if (!(productType === 'new')) {
              return readOnlyInput
            } else {
              return defaultInput
            }

          // render some fileds as textarea. Use switch fallthrough...
          case 'quantity-comments':
          case 'quantity-references':
          case 'foodwaste-comment':
          case 'co2-calculation':
          case 'info-text':
          case 'references':
          case 'other-references':
          case 'comments':
            return (
              <InputWrapper key={String(key)} fieldName={key}>
                <Input
                  type='textarea'
                  id={key}
                  onChange={this.handleInputChange}
                  value={value || ''} />
              </InputWrapper>
            )

          case 'linked-id':
            return (
              <InputWrapper key={String(key)} fieldName={key}>
                <Oracle
                  updateEditedProduct={this.props.actions.updateEditedProduct}
                  id={key}
                  data={products}
                  // search is what will be searched for in the data
                  searchFor='name'
                  // autocomplete is what will be put in the input when
                  // suggestion is clicked
                  autocomplete='id'
                  additionalRenderedFields={['id']}
                  value={value || ''}
                  />
              </InputWrapper>
            )

          case 'fao-product-id':
            return (
              <InputWrapper key={String(key)} fieldName={key}>
                <Oracle
                  updateEditedProduct={this.props.actions.updateEditedProduct}
                  id={key}
                  data={faos}
                  // search is what will be searched for in the data
                  searchFor='fao-name'
                  // autocomplete is what will be put in the input when
                  // suggestion is clicked
                  autocomplete='fao-code'
                  additionalRenderedFields={['fao-code']}
                  value={value || ''}
                  />
              </InputWrapper>
            )

          case 'synonyms':
            return (
              <InputWrapper key={String(key)} fieldName={key}>
                <ChipInput
                  hintText='add synonym'
                  defaultValue={editedProduct.synonyms}
                  onChange={synonyms => this.handleSynonymChange(synonyms)}
                  fullWidthInput
                  style={{ width: '100%' }}
                 />
              </InputWrapper>
            )

          case 'processes':
            return (
              <InputWrapper key={String(key)} fieldName={key}>
                <Input
                  type='text'
                  id={key}
                  readOnly
                  value='Processes array not editable...' />
              </InputWrapper>
            )

          // do not show filename field
          case 'filename':
            return <div key={String(key)} />

          default:
            return defaultInput
        }
      })
  }

  renderEditView = () => {
    return (
      <div className={styles.container}>
        <Card>
          <CardBlock>
            <CardTitle>{this.props.editedProduct.name}</CardTitle>
            <CardSubtitle>{this.props.editedProduct.filename}</CardSubtitle>
          </CardBlock>
          <CardBlock>
            <Form>
              {this.renderInputs()}
            </Form>
          </CardBlock>
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
        </Card>
      </div>
    )
  }

  render () {
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
        {this.renderEditView()}
      </div>
    )
  }
}

export default Edit
