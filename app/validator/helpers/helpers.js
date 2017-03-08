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

const _loadAllProducts = (isValidProductFilename, dataDir) => {
  const filenames = fs.readdirSync(`${dataDir}/prods`)
  const prods = filenames
    .filter(filename => isValidProductFilename(filename))
    .map(filename => {
      const pathToProduct = `${dataDir}/prods/${filename}`
      const product = loadProduct(pathToProduct)
      return product
    })

  return prods
}

export const loadAllProducts = partial(_loadAllProducts, isValidProductFilename)

export const loadFaos = dataDir => {
  const faos = jsonfile.readFileSync(`${dataDir}/fao-product-list.json`)
  return faos
}

export const loadNutrs = dataDir => {
  const filenames = fs.readdirSync(`${dataDir}/nutrs`)
  const nutrs = filenames
    .filter(filename => {
      const filenameRegEx = /^.+(nutr\.json)/g
      return filenameRegEx.test(filename)
    })
    .map(filename => jsonfile.readFileSync(`${dataDir}/nutrs/${filename}`))

  return nutrs
}

export const loadNutrChange = dataDir => {
  const filenames = fs.readdirSync(`${dataDir}/nutr-change`)
  const nutrChange = filenames
  .filter(filename => {
    const filenameRegEx = /^.+(nutr-change\.json)/g
    return filenameRegEx.test(filename)
  })
  .map(filename => jsonfile.readFileSync(`${dataDir}/nutr-change/${filename}`))

  return nutrChange
}

export const loadProductSchema = dataDir => {
  return jsonfile.readFileSync(`${dataDir}/prod.schema.json`)
}

export const removeHelperFields = product => {
  const cleanCopy = {...product}
  delete cleanCopy.filename
  delete cleanCopy.validationSummary
  return cleanCopy
}

export const resetValidation = product => {
  const cleanCopy = {...product}
  delete cleanCopy.validationSummary
  return cleanCopy
}

export const _saveProduct = (removeHelperFields, dataDir, product) => {
  const {filename} = product
  const cleanProduct = removeHelperFields(product)
  jsonfile.writeFileSync(`${dataDir}/prods/${filename}`, cleanProduct)
}

// Hey future me: what's the (dis)advantage of doing this vs. just using
// _removeHelperFields from the enclosiong scope? It's not a pure function
// anyway because it saves a file which is an obvious side effect...
export const saveProduct = partial(_saveProduct, removeHelperFields)

export const saveAllProducts = (dataDir, prods) => {
  jsonfile.writeFileSync(`${dataDir}/prods.all.json`, prods)
}
