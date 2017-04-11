import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Chip from '../Chip/Chip'

class SynonymsField extends Component {
  static propTypes = {
    formData: PropTypes.array,
    onChange: PropTypes.func.isRequired
  }

  state = {
    newSynonym: '',
    formData: this.props.formData || []
  }

  handleSynonymInput = event => {
    this.setState({
      newSynonym: event.target.value
    })
  }

  handleAddSynonym = event => {
    const { keyCode } = event
    var { onChange } = this.props

    if (keyCode === 13) {
      // setState accepts a callback as second argument which gets executed when
      // setState has completed. It's used here instead of componentDidUpdate
      // because the update should only happen in response to this specific
      // keyDown event
      this.setState({
        formData: [
          ...this.state.formData,
          this.state.newSynonym
        ]},
        () => {
          onChange(this.state.formData)
          this.setState({
            newSynonym: ''
          })
        }
      )
    }
  }

  handleRemoveSynonym = event => {
    const id = Number(event.target.id)
    var { onChange } = this.props

    this.setState({
      formData: [
        ...this.state.formData.slice(0, id),
        ...this.state.formData.slice(id + 1)
      ]},
      () => {
        onChange(this.state.formData)
        this.setState({
          newSynonym: ''
        })
      }
    )
  }

  render () {
    const chips = this.state.formData.map((syn, index) => {
      return (
        <Chip
          key={index}
          id={String(index)}
          value={syn}
          handleRemoveClick={this.handleRemoveSynonym} />
      )
    })

    return (
      <div>
        {chips}
        <br />
        <input
          onKeyDown={(e) => this.handleAddSynonym(e)}
          onChange={this.handleSynonymInput}
          value={this.state.newSynonym}
          placeholder='add synonym and press enter' />
      </div>
    )
  }
}

export default SynonymsField
