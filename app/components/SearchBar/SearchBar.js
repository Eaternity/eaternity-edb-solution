import React, { Component, PropTypes } from 'react'
import { Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupButton, Nav, Navbar, NavItem, Row } from 'reactstrap'
import fileSystemApi from '../../filesystem-api/filesystem-api'
import menu from './menu.png'
import logo from './logo.png'
// import searchIcon from './search.png'
import styles from './SearchBar.css'

class SearchBar extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    editedProduct: PropTypes.object.isRequired,
    dataDir: PropTypes.string.isRequired
  }

  state = {
    searchDropdownOpen: false,
    dataDirDropdownOpen: false,
    searchFor: 'all fields'
  }

  toggleSearchDropdown = () => {
    this.setState({
      searchDropdownOpen: !this.state.searchDropdownOpen
    })
  }

  toggleDataDirDropdown = () => {
    this.setState({
      dataDirDropdownOpen: !this.state.dataDirDropdownOpen
    })
  }

  handleSearchAll = () => {
    this.props.actions.setSearchFilter([
      'Id',
      'Name',
      'Synonyms',
      'Tags',
      'Co2-value'
    ])

    this.setState({
      searchFor: 'search all fields'
    })
  }

  handleSearchRefs = () => {
    this.props.actions.setSearchFilter(['Refs'])

    this.setState({
      searchFor: 'search for references'
    })
  }

  handleKeyUp = (e) => {
    const searchInput = e.target.value
    this.props.actions.updateSearchInput(searchInput)
  }

  handleChooseDir = () => {
    const { setDataDir, fetchAllProducts, fetchAllFAOs, fetchAllNutrients } =
      this.props.actions
    fileSystemApi.chooseDataDir()
      .then(dataDir => {
        setDataDir(dataDir)
        fetchAllProducts()
        fetchAllFAOs()
        fetchAllNutrients()
      })
  }

  handleAddNewProduct = () => {
    const { setEditedProductToNew, setProductType, changeLocation } =
      this.props.actions

    setEditedProductToNew()
    setProductType('new')
    changeLocation(`/edit/${this.props.editedProduct.id}`)
  }

  render () {
    return (
      <div>
        <Navbar color='faded'>
          <Container>
            <Row>
              <Col sm='2'>
                <Nav navbar>
                  <NavItem>
                    <img className={styles.logo} src={logo} alt='logo' />
                  </NavItem>
                </Nav>
              </Col>
              <Col sm='8'>
                <Nav navbar>
                  <NavItem>
                    <InputGroup>
                      <InputGroupButton>
                        <Dropdown
                          isOpen={this.state.searchDropdownOpen} toggle={this.toggleSearchDropdown} >
                          <DropdownToggle caret>
                            Search for
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem
                              onClick={() => this.handleSearchAll()}>
                              All fields
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => this.handleSearchRefs()}>
                              References
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </InputGroupButton>
                      <Input
                        onKeyUp={(e) => this.handleKeyUp(e)}
                        placeholder={this.state.searchFor} />
                    </InputGroup>
                  </NavItem>
                </Nav>
              </Col>
              <Col sm='2'>
                <Nav navbar>
                  <NavItem>
                    <Dropdown
                      isOpen={this.state.dataDirDropdownOpen} toggle={this.toggleDataDirDropdown}>
                      <DropdownToggle>
                        <img className={styles.menu} src={menu} alt='menuIcon' />
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem
                          onClick={() => this.handleChooseDir()}>
                          Choose data directory
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => this.handleAddNewProduct()}
                          disabled={!this.props.dataDir}>
                          Add new product
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </NavItem>
                </Nav>
              </Col>
            </Row>
          </Container>
        </Navbar>
      </div>
    )
  }
}

export default SearchBar
