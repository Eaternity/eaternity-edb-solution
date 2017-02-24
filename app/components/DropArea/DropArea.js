import React, { PropTypes } from 'react'
import { Button } from 'reactstrap'
import fileSystemApi from '../../filesystem-api/filesystem-api'
import styles from './DropArea.css'

const DropArea = props => {
  const {
    setDataDir,
    fetchProductSchema,
    fetchAllProducts,
    fetchAllFAOs,
    fetchAllNutrients
  } = props.actions

  // somehow electron needs both event handlers, handleDragOver and handleDrop
  // to be able to prevent default...
  const handleDragOver = event => {
    event.preventDefault()
  }

  const handleDrop = event => {
    event.preventDefault()
    const dataDir = event.dataTransfer.files[0].path
    setDataDir(dataDir)
    fetchProductSchema()
    fetchAllProducts()
    fetchAllFAOs()
    fetchAllNutrients()
  }

  const handleChooseDir = () => {
    fileSystemApi.chooseDataDir()
      .then(dataDir => {
        setDataDir(dataDir)
        fetchProductSchema()
        fetchAllProducts()
        fetchAllFAOs()
        fetchAllNutrients()
      })
  }

  return (
    <div
      className={styles.droparea}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      <h3>Nothing here yet...</h3>
      <p>Choose data folder or drop it here!</p>
      <Button
        onClick={handleChooseDir}
        outline
        color='success' >
        Choose data dir
      </Button>
    </div>
  )
}

DropArea.propTypes = {
  actions: PropTypes.object.isRequired
}

export default DropArea
