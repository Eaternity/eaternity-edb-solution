import { ipcRenderer } from 'electron'

// TODO: where would one need to put this code so it can trigger/dispatch
// saveEditedProduct()... Real mindfuck for me...
ipcRenderer.on('save-edited-product', event => {
  console.log('save triggered with shortcut')
})
