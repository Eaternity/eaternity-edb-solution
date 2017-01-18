import React from 'react'
import { ipcRenderer } from 'electron'
import { Button } from 'reactstrap'
import styles from './DropArea.css'

const DropArea = (props) => {
  // somehow electron needs both event handlers to be able to prevent default...
  const handleDragOver = e => {
    e.preventDefault()
  }

  const handleDrop = e => {
    e.preventDefault()
    const dataDir = e.dataTransfer.files[0].path
    props.actions.changeDataDir(dataDir)
    props.actions.fetchAllProducts()
    props.actions.fetchAllFAOs()
    props.actions.fetchAllNutrients()
  }

  const handleChooseDir = () => {
    ipcRenderer.send('choose-data-dir')
    ipcRenderer.on('data-dir-choosen', (event, choosenDir) => {
      if (choosenDir) {
        props.actions.changeDataDir(choosenDir)
        props.actions.fetchAllProducts()
        props.actions.fetchAllFAOs()
        props.actions.fetchAllNutrients()
      }
    })
  }

  return (
    <div
      className={styles.droparea}
      onDragOver={(e) => handleDragOver(e)}
      onDrop={(e) => handleDrop(e)}>
      <h3> Nothing here yet...</h3>
      <p>Choose data folder or drop it here!</p>
      <Button
        onClick={() => handleChooseDir()}
        outline
        color='success' >
        Choose data dir
      </Button>
    </div>
  )
}

export default DropArea
