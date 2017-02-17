import React, { Component, PropTypes } from 'react'
import Autosuggest from 'react-autosuggest'
import theme from './Oracle.css'

class Oracle extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    formContext: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
  }

  state = {
    suggestions: [],
    autosuggestValue: ''
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = value => {
    const { allData } = this.props.formContext
    const { dataSelector, searchFor } = this.props.options
    const data = allData[dataSelector]
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length

    return inputLength === 0 ? [] : data.filter(obj =>
      obj[searchFor] !== null && obj[searchFor] !== undefined &&
      obj[searchFor].toLowerCase().slice(0, inputLength) === inputValue
    )
  }

  getSuggestionValue = suggestion => {
    // REFACT: it is important that the value we get from the oracle here
    // has the same type as required in the input field! For example the
    // fao-product-id field in the product specifies type string through
    // the schema but the field in fao-product-list.json is an integer... So
    // it has to be converted...
    const { autocomplete } = this.props.options
    return String(suggestion[autocomplete])
  }

  // Autosuggest will call this function every time you need to update
  // suggestions
  handleSuggestionFetch = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    })
  }

  // Autosuggest will call this function every time you need to clear
  // suggestions.
  handleSuggestionClear = () => {
    this.setState({
      suggestions: []
    })
  }

  handleInputChange = (event, { newValue }) => {
    // Holy crap this was almost killing me... The new value comes in
    // as event.target.value OR newWalue. Why?
    const value = newValue || event.target.value
    const { onChange } = this.props
    onChange(value)
  }

  // Use your imagination to render suggestions.
  renderSuggestion = suggestion => {
    const { searchFor, additionalRenderedFields } = this.props.options
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
    const { id, value } = this.props
    const { dataSelector, searchFor } = this.props.options
    // Autosuggest will pass inputProps to the input element
    const inputProps = {
      placeholder: `Search for ${dataSelector} ${searchFor}...`,
      value: value || '',
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
