import React, { Component, PropTypes } from 'react'
import { Button, Card, CardBlock, CardTitle, CardSubtitle, Col, Input, Form, FormGroup, Label } from 'reactstrap'
import Autosuggest from 'react-autosuggest'
import ConfirmRejectModal from '../ConfirmRejectModal/ConfirmRejectModal'
import EditBar from '../EditBar/EditBar'
import ChipInput from 'material-ui-chip-input'

import styles from './Edit.css'
import autosuggest from './autosuggest.css'

class Edit extends Component {
  static propTypes = {
    dataDir: PropTypes.string.isRequired,
    editedProduct: PropTypes.object.isRequired,
    orderedKeys: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    saveModalOpen: false,
    backModalOpen: false,
    suggestions: [], // for autosuggest
    autosuggestId: '',
    autosuggestValue: ''
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = value => {
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length

    return inputLength === 0 ? [] : this.props.products.filter(product =>
      product.name !== null && product.name !== undefined && product.name.toLowerCase().slice(0, inputLength) === inputValue
    )
  }

  getSuggestionValue = suggestion => suggestion.id.toString()

  // Autosuggest will call this function every time you need to update
  // suggestions
  handleSuggestionFetch = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    })
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  handleSuggestionClear = () => {
    this.setState({
      suggestions: []
    })
  }

  toggleSaveModal = () => {
    this.setState({
      saveModalOpen: !this.state.saveModalOpen
    })
  }

  // Use your imagination to render suggestions.
  renderSuggestion = suggestion => (
    <div>
      {`${suggestion.name} (id: ${suggestion.id})`}
    </div>
  )

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

  handleInputChange = (event, { newValue }) => {
    // HACK: How to get the id when autosuggest is clicked??? Here I get it
    // from previous input into the search field and "cache" it...
    if (event.target.id) {
      this.setState({
        autosuggestId: event.target.id
      })
    }

    this.setState({
      autosuggestValue: newValue
    })
    this.props.actions.updateEditedProduct(this.state.autosuggestId, newValue)
  }

  handleSynonymChange = synonyms => {
    this.props.actions.updateEditedProduct('synonyms', synonyms)
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
              id: 'linked-id',
              placeholder: 'Search for product name...',
              value: this.props.editedProduct[key] ||
                this.state.autosuggestValue,
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
                    theme={autosuggest}
                    suggestions={this.state.suggestions}
                    inputProps={inputProps}
                    onSuggestionsFetchRequested={this.handleSuggestionFetch}
                    onSuggestionsClearRequested={this.handleSuggestionClear}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion} />
                </Col>
              </div>
            )

          case 'synonyms':
            return (
              <div>
                <Label for={key} sm={4}>
                  {key}
                </Label>
                <Col sm={8}>
                  <ChipInput
                    defaultValue={this.props.editedProduct.synonyms}
                    onChange={(synonyms) => this.handleSynonymChange(synonyms)}
                    fullWidthInput
                    style={{ width: '100%' }}
                  />
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
