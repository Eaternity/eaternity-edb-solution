import React, { Component, PropTypes } from 'react'
import { Button, Card, CardBlock, CardTitle, CardSubtitle, Col, Input, Form, FormGroup, Label, Popover, PopoverTitle, PopoverContent } from 'reactstrap'
import Autosuggest from 'react-autosuggest'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import EditBar from '../EditBar/EditBar'
import styles from './Edit.css'

class Edit extends Component {
  static propTypes = {
    dataDir: PropTypes.string.isRequired,
    editedProduct: PropTypes.object.isRequired,
    orderedKeys: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    fieldname: '',
    saveModalOpen: false,
    backModalOpen: false,
    popoverOpen: false
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

  togglePopover = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    })
  }

  handleSaveConfirmClick = () => {
    this.props.actions.mergeEditedToProducts()
    this.props.actions.saveAllProducts()
    this.toggleSaveModal()
  }

  handleBackConfirmClick = () => {
    this.props.actions.clearSearchInput()
    this.props.actions.changeLocation('/')
    this.toggleBackModal()
  }

  handleInputChange = event => {
    this.props.actions.updateEditedProduct(event.target.id, event.target.value)
  }

  handleFieldnameInput = event => {
    this.setState({
      fieldname: event.target.value
    })
  }

  handleCreateFieldClick = () => {
    const fieldname = this.state.fieldname
    this.props.actions.updateEditedProduct(fieldname, '')
    this.togglePopover()
    this.setState({
      fieldname: ''
    })
  }

  renderFormGroup = () => {
    return this.props.orderedKeys.map(key => {
      const renderInputs = () => {
        switch (key) {
          case 'filename':
            return <div />

          case 'validationSummary':
            return <div />

          case 'id':
            // id is read only!
            return (
              <div>
                <Label for={key} sm={4}>
                  {key}
                </Label>
                <Col sm={8}>
                  <Input
                    type='text'
                    id={key}
                    readOnly
                    value={this.props.editedProduct[key]} />
                </Col>
              </div>
            )

          case 'processes':
            return (
              <div>
                <Label for={key} sm={4}>
                  {key}
                </Label>
                <Col sm={8}>
                  <Input
                    type='text'
                    id={key}
                    readOnly
                    value='Processes array not editable... Sorry!' />
                </Col>
              </div>
            )

          case 'linked-id':
            // Autosuggest will pass through all these props to the input
            // element
            const inputProps = {
              placeholder: 'Search for product name...',
              value: this.props.editedProduct[key] || '',
              onChange: this.handleInputChange
            }
            return (
              <div>
                <Label for={key} sm={4}>
                  {key}
                </Label>
                <Col sm={8}>
                  <Autosuggest
                    id={key}
                    suggestions={this.props.products}
                    inputProps={inputProps}
                    onSuggestionsFetchRequested={this.handleSuggestionFetch}
                    onSuggestionsClearRequested={this.handleSuggestionClear}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion} />
                </Col>
              </div>
            )

          default:
            return (
              <div>
                <Label for={key} sm={4}>
                  {key}
                </Label>
                <Col sm={8}>
                  <Input
                    type='text'
                    id={key}
                    onChange={this.handleInputChange}
                    value={this.props.editedProduct[key] || ''} />
                </Col>
              </div>
            )
        }
      }

      return (
        <FormGroup key={key} row>
          {renderInputs()}
        </FormGroup>
      )
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
              {this.renderFormGroup()}
            </Form>
          </CardBlock>
          <CardBlock>
            <div className={styles.editBtnGroup}>
              <Col sm={2}>
                <Button
                  onClick={() => this.togglePopover()}
                  outline
                  id='addField'
                  color='warning'
                  block >
                  Add field
                </Button>
                <Popover
                  placement='top'
                  isOpen={this.state.popoverOpen}
                  target='addField'
                  toggle={this.togglePopover}>
                  <PopoverTitle>
                    Enter field name
                  </PopoverTitle>
                  <PopoverContent>
                    <Input
                      type='text'
                      onKeyUp={this.handleFieldnameInput}
                      placeholder='fieldname' />
                  </PopoverContent>
                  <PopoverContent className={styles.popoverBtn}>
                    <Button
                      onClick={() => this.handleCreateFieldClick()}
                      size='sm'
                      color='success'>
                      Create field
                    </Button>
                  </PopoverContent>
                </Popover>
              </Col>
              <Col sm={3}>
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
