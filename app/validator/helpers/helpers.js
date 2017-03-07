import fs from 'fs'
import jsonfile from 'jsonfile'
import {partial} from '../../utils/utils'

// set indentation for jsonfile
jsonfile.spaces = 2

export const addFilename = (product, filename) => {
  if (product) {
    return Object.assign({}, product, {filename})
  }
}

export const isValidProductFilename = filename => {
    // http://regexr.com/ is awesome!
  const filenameRegEx = /^\d.+(prod\.json)/g
  return filenameRegEx.test(filename)
}

const _loadProduct = (addFilename, pathToProduct) => {
  const filename = pathToProduct.split('/').pop()
  if (isValidProductFilename(filename)) {
    const product = jsonfile.readFileSync(pathToProduct)
    return addFilename(product, filename)
  }
}

export const loadProduct = partial(_loadProduct, addFilename)

const _loadAllProducts = (addFilename, dataDir) => {
  const filenames = fs.readdirSync(`${dataDir}/prods`)
  const prods = filenames
    .map(filename => {
      const pathToProduct = `${dataDir}/prods/${filename}`
      const product = loadProduct(pathToProduct)
      return product
    })
    .filter(product => product)

  return prods
}

export const loadAllProducts = partial(_loadAllProducts, addFilename)

export const loadFAOS = dataDir => {
  const faos = jsonfile.readFileSync(`${dataDir}/fao-product-list.json`)
  return faos
}

export const loadNutrs = dataDir => {
  const nutrsFilenames = fs.readdirSync(`${dataDir}/nutrs`)
  const nutrs = nutrsFilenames.map(filename => {
    return jsonfile.readFileSync(`${dataDir}/nutrs/${filename}`)
  })

  return nutrs
}

export const loadNutrChange = dataDir => {
  const nutrChangeFilenames = fs.readdirSync(`${dataDir}/nutr-change`)

  const nutrChange = nutrChangeFilenames.map(filename => {
    return jsonfile.readFileSync(`${dataDir}/nutr-change/${filename}`)
  })

  return nutrChange
}

export const loadProductSchema = dataDir => {
  return jsonfile.readFileSync(`${dataDir}/prod.schema.json`)
}

export const removeHelperFields = product => {
  const cleanCopy = Object.assign({}, product)
  delete cleanCopy.filename
  delete cleanCopy.validationSummary
  return cleanCopy
}

export const _saveProduct = (removeHelperFields, targetDir, product) => {
  const {filename} = product
  const cleanProduct = removeHelperFields(product)
  jsonfile.writeFileSync(`${targetDir}/${filename}`, cleanProduct)
}

// Hey future me: what's the (dis)advantage of doing this vs. just using
// _removeHelperFields from the enclosiong scope? It's not a pure function
// anyway because it saves a file which is an obvious side effect...
export const saveProduct = partial(_saveProduct, removeHelperFields)

export const saveAllProducts = (dataDir, prods) => {
  jsonfile.writeFileSync(`${dataDir}/prods.all.json`, prods)
}
