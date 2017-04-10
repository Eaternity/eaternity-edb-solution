import fs from 'fs'
import jsonfile from 'jsonfile'
import {curry} from 'ramda'
import json2csv from 'json2csv'

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

const curriedLoadProduct = curry(_loadProduct)
export const loadProduct = curriedLoadProduct(addFilename)

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

const curriedLoadAllProducts = curry(_loadAllProducts)
export const loadAllProducts = curriedLoadAllProducts(isValidProductFilename)

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
const curriedSaveProduct = curry(_saveProduct)
export const saveProduct = curriedSaveProduct(removeHelperFields)

export const saveAllProducts = (dataDir, prods) => {
  jsonfile.writeFileSync(`${dataDir}/prods.all.json`, prods)
}

const _saveAllProductsToCsv = (fields, dataDir, prods) => {
  const filename = 'EDB_Products-Export.csv'
  const result = json2csv({ data: prods, fields: fields })
  fs.writeFileSync(`${dataDir}/${filename}`, result)
  return result
}

export const saveAllProductsToCsv = curry(_saveAllProductsToCsv)
