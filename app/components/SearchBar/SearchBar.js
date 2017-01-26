import React, { Component, PropTypes } from 'react'
import { Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupAddon, Nav, Navbar, NavItem, Row } from 'reactstrap'
import fileSystemApi from '../../filesystem-api/filesystem-api'
import menu from './menu.png'
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
    fileSystemApi.chooseDataDir()
      .then(dataDir => {
        this.props.actions.setDataDir(dataDir)
      })
  }

  toggleDropdown = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }

  handleKeyUp = (e) => {
    const searchInput = e.target.value
    this.props.actions.updateSearchInput(searchInput)
  }

  handlePlusClick = () => {
    this.props.actions.setEditedProductToNew()
    this.props.actions.changeLocation(`/edit/${this.props.editedProduct.id}`)
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
                      <InputGroupAddon>
                        <img className={styles.search} src={searchIcon} alt='searchIcon' />
                      </InputGroupAddon>
                      <Input
                        onKeyUp={(e) => this.handleKeyUp(e)}
                        placeholder='search for ...' />
                    </InputGroup>
                  </NavItem>
                </Nav>
              </Col>
              <Col sm='2'>
                <Nav navbar>
                  <NavItem>
                    <Dropdown
                      isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                      <DropdownToggle>
                        <img className={styles.menu} src={menu} alt='menuIcon' />
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem
                          onClick={() => this.handleChooseDir()}>
                          Choose data directory
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => this.handlePlusClick()}
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
