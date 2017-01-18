import React, { PropTypes } from 'react'
import { Button, Card, CardBlock, CardTitle, CardSubtitle, Col, Input, Form, FormGroup, Label } from 'reactstrap'
import EditBar from '../EditBar/EditBar'
import styles from './NewProduct.css'

const NewProduct = (props) => {
  const inputData = {
    name: 'test',
    fielname: 'test.json',
    id: 1000000
  }

  const handleInputChange = (e) => {
    console.log(e.target.id, e.target.value)
  }

  const handleSaveClick = () => {
    console.log('save clicked')
  }

  const renderNewProduct = () => {
    const inputs = Object.keys(inputData).map(key => {
      return (
        <FormGroup key={key} row>
          <Label for={key} sm={4}>{key}</Label>
          <Col sm={8}>
            <Input
              type='text'
              id={key}
              onKeyUp={(e) => handleInputChange(e)}
              placeholder={props.selectedProduct[key]} />
          </Col>
        </FormGroup>
      )
    })

    return <div className={styles.container}>
      <Card>
        <CardBlock>
          <CardTitle>{inputData.name}</CardTitle>
          <CardSubtitle>{inputData.filename}</CardSubtitle>
        </CardBlock>
        <CardBlock>
          <Form>
            {inputs}
          </Form>
        </CardBlock>
        <CardBlock>
          <Button
            onClick={() => handleSaveClick()}
            outline
            color='success'
            block >
            Save changes
          </Button>
        </CardBlock>
      </Card>
    </div>
  }

  return <div>
    <EditBar actions={props.actions} />
    {renderNewProduct()}
  </div>
}

NewProduct.propTypes = {
  actions: PropTypes.object.isRequired
}

export default NewProduct
