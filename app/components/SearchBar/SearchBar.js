import React, { Component, PropTypes } from 'react'
import { ipcRenderer } from 'electron'
import { Button, Col, Input, InputGroup, InputGroupAddon, Nav, Navbar, NavbarBrand } from 'reactstrap'
import logo from './logo.png'
import searchIcon from './search.png'
import styles from './SearchBar.css'

class SearchBar extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    editedProduct: PropTypes.object.isRequired,
    dataDir: PropTypes.string.isRequired
  }

  state = {
    dropdownOpen: false
  }

  handleChooseDir = () => {
    ipcRenderer.send('choose-data-dir')
    ipcRenderer.on('data-dir-choosen', (event, choosenDir) => {
      if (choosenDir) {
        this.props.actions.changeDataDir(choosenDir)
        this.props.actions.fetchAllProducts()
        this.props.actions.fetchAllFAOs()
        this.props.actions.fetchAllNutrients()
      }
    })
  }

  handleKeyUp = (e) => {
    const searchInput = e.target.value
    this.props.actions.updateSearchInput(searchInput)
  }

  handlePlusClick = () => {
    console.log('clicked')
    // this.props.actions.setEditedProductToNew()
    // this.props.actions.changeLocation(`/edit/${this.props.editedProduct.id}`)
  }

  render () {
    return (
      <Navbar color='faded' light>
        <NavbarBrand>
          <img className={styles.logo} src={logo} alt='logo' />
        </NavbarBrand>
        <Nav navbar >
          <Col sm='7' >
            <InputGroup>
              <InputGroupAddon>
                <img className={styles.search} src={searchIcon} alt='searchIcon' />
              </InputGroupAddon>
              <Input
                onKeyUp={(e) => this.handleKeyUp(e)}
                placeholder='search...' />
            </InputGroup>
          </Col>
        </Nav>
        <Nav navbar>
          <Button
            onClick={() => this.handleChooseDir()}
            outline
            color='success'
            size='sm' >
            Choose data dir
          </Button>{' '}
          <Button
            onClick={() => this.handlePlusClick()}
            outline
            color='success'
            size='sm' >
            Add new product
          </Button>
        </Nav>
      </Navbar>
    )
  }
}

export default SearchBar
