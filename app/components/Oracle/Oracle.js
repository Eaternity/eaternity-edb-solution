import React, { Component, PropTypes } from 'react'
import Autosuggest from 'react-autosuggest'
import theme from './Oracle.css'

class Oracle extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    searchFor: PropTypes.string.isRequired,
    autocomplete: PropTypes.string.isRequired,
    additionalRenderedFields: PropTypes.array.isRequired,
    value: PropTypes.node.isRequired,
    updateEditedProduct: PropTypes.func.isRequired
  }

  state = {
    suggestions: [],
    autosuggestFieldId: '',
    autosuggestValue: ''
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = value => {
    const { data, searchFor } = this.props
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length

    return inputLength === 0 ? [] : data.filter(obj =>
      obj[searchFor] !== null && obj[searchFor] !== undefined && obj[searchFor].toLowerCase().slice(0, inputLength) === inputValue
    )
  }

  getSuggestionValue = suggestion => {
    const { autocomplete } = this.props
    return String(suggestion[autocomplete])
  }

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

  handleInputChange = (event, { newValue }) => {
    const { updateEditedProduct, id } = this.props
    // HACK: How to get the id when autosuggest is clicked??? Here I get it
    // from previous input into the search field and "cache" it...
    if (event.target.id) {
      this.setState({
        autosuggestFieldId: event.target.id
      })
    }

    this.setState({
      autosuggestValue: newValue
    })

    updateEditedProduct(id, newValue)
  }

  // Use your imagination to render suggestions.
  renderSuggestion = suggestion => {
    const { searchFor, additionalRenderedFields } = this.props
    const additionalFields = additionalRenderedFields.map(field => {
      return `${field}: ${suggestion[field]}`
    }).join(', ')

    return (
      <div>
        {`${suggestion[searchFor]} (${additionalFields})`}
      </div>
    )
  }

  render () {
    const { id, searchFor, value } = this.props
    // Autosuggest will pass inputProps to the input element
    const inputProps = {
      id,
      placeholder: `Search for ${searchFor}...`,
      value: value || this.state.autosuggestValue,
      onChange: this.handleInputChange
    }

    return (
      <Autosuggest
        id={id}
        theme={theme}
        suggestions={this.state.suggestions}
        inputProps={inputProps}
        onSuggestionsFetchRequested={this.handleSuggestionFetch}
        onSuggestionsClearRequested={this.handleSuggestionClear}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion} />
    )
  }
}

export default Oracle
