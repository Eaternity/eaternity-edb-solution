import path from 'path'
import fs from 'fs'
import jsonfile from 'jsonfile'
import _ from 'lodash'
import {
  isValidProductFilename,
  addFilename,
  removeHelperFields,
  resetValidation,
  loadProduct,
  loadAllProducts,
  loadFaos,
  loadNutrs,
  loadNutrChange,
  loadProductSchema,
  _saveProduct,
  saveProduct,
  saveAllProducts,
  saveAllProductsToCsv
} from './helpers'

// Point to fake test resources
const dataDir = path.resolve(`${__dirname}`, '../eaternity-edb-data-fake')
const productSchema = loadProductSchema(dataDir)
const orderedKeys = Object.keys(productSchema.properties)

describe('helpers', () => {
  test('addFilename adds filename field to object', () => {
    const someObject = {
      id: 1,
      name: 'some object'
    }
    const expectedObjectWithFilename = {
      id: 1,
      name: 'some object',
      filename: 'some-object.json'
    }
    const objectWithFilename = addFilename(someObject, 'some-object.json')
    expect(objectWithFilename).toEqual(expectedObjectWithFilename)
  })

  test('isValidProductFilename knows valid filenames', () => {
    const filenames = [
      'prod.json',
      '1234.json',
      '1-a-prod.json',
      '12-b-prod.json',
      '123-a-b-prod.json',
      '1234-a-b-c-prod.json'
    ]
    const expectedValidFilanames = [
      '1-a-prod.json',
      '12-b-prod.json',
      '123-a-b-prod.json',
      '1234-a-b-c-prod.json'
    ]
    const validFilenames = filenames.filter(filename => {
      return isValidProductFilename(filename)
    })
    expect(validFilenames).toEqual(expectedValidFilanames)
  })

  test('loadProduct returns undefined when product filename is invalid', () => {
    const pathToProductWithInvalidName =
      `${dataDir}/prods/10-wrong-filename.json`
    expect(loadProduct(pathToProductWithInvalidName)).toBeUndefined()
  })

  it('loadProduct loads product with correct filename', () => {
    const pathToFile = `${dataDir}/prods/3-child-prod.json`
    const someProduct = jsonfile.readFileSync(pathToFile)
    const expectedProduct = addFilename(someProduct, '3-child-prod.json')
    const product = loadProduct(pathToFile)
    expect(product).toEqual(expectedProduct)
  })

  test('loadAllProducts loads all products with valid filename', () => {
    const allProducts = loadAllProducts(dataDir)
    const invalidFilename = '10-wrong-filename.json'
    const productFilenames = fs.readdirSync(`${dataDir}/prods`)
    const correctProdFileNames = productFilenames.filter(filename => {
      return filename !== invalidFilename
    })
    const randomCorrectProductFilename = _.sample(correctProdFileNames)
    const randomCorrectProduct = jsonfile.readFileSync(
      `${dataDir}/prods/${randomCorrectProductFilename}`
    )

    // loadAllProducts adds a filename field to each prouct during load
    randomCorrectProduct.filename = randomCorrectProductFilename

    const prodsContainRandomCorrectProduct = allProducts.some(prod => {
      return _.isEqual(prod, randomCorrectProduct)
    })

    expect(allProducts.length).toEqual(13)
    expect(prodsContainRandomCorrectProduct).toBeTruthy()
  })

  test('loadFaos loads fao-product-list.json correctly', () => {
    const faos = loadFaos(dataDir)
    const expectedFaos = [
      {
        'fao-code': 1,
        'fao-name': 'FAO 1',
        'definition': 'Definition 1'
      },
      {
        'fao-code': 2,
        'fao-name': 'FAO 2',
        'definition': 'Definition 2'
      }
    ]

    expect(faos).toEqual(expectedFaos)
  })

  test('loadNutrs only loads files with correct filename', () => {
    const nutrs = loadNutrs(dataDir)
    const expectedNutrs = [
      {
        'name': 'Fake nutr',
        'id': '1'
      }
    ]
    expect(nutrs).toEqual(expectedNutrs)
  })

  test('loadNutrChange only loads files with correct filename', () => {
    const nutrChange = loadNutrChange(dataDir)
    const expectedNutrChange = [
      {
        'id': 1,
        'name': 'fake',
        'process': 'cooked'
      }
    ]
    expect(nutrChange).toEqual(expectedNutrChange)
  })

  test('loadProductSchema loads product schema', () => {
    const expectedProductschema = jsonfile.readFileSync(
      `${dataDir}/prod.schema.json`
    )
    const productSchema = loadProductSchema(dataDir)
    expect(productSchema).toEqual(expectedProductschema)
  })

  test('_removeHelperFields removes filename and validationSummary', () => {
    const productWithHelperFields = jsonfile.readFileSync(
      `${dataDir}/prods/13-helpers-prod.json`
    )
    const expectedProductWithoutHelpers = {
      'id': 13,
      'name': 'Helpers'
    }
    const productWithoutHelpers = removeHelperFields(productWithHelperFields)
    expect(productWithoutHelpers).toEqual(expectedProductWithoutHelpers)
  })

  test('resetValidation removes validationSummary', () => {
    const productWithValidation = jsonfile.readFileSync(
      `${dataDir}/prods/13-helpers-prod.json`
    )
    const expectedProductWithoutValidation = {
      id: 13,
      name: 'Helpers',
      filename: '13-helpers-prod.json'
    }
    const productWithoutValidation = resetValidation(productWithValidation)
    expect(productWithoutValidation).toEqual(expectedProductWithoutValidation)
  })

  it('_saveProduct removes helper fields and saves product', () => {
    const filename = '100000-save-me-prod.json'
    const pathToFile = `${dataDir}/prods/${filename}`
    const productToSave = {
      id: 100000,
      name: 'save me',
      filename,
      validationSummary: {}
    }

    _saveProduct(removeHelperFields, dataDir, productToSave)

    const prodFilenames = fs.readdirSync(`${dataDir}/prods`)
    expect(prodFilenames.includes(filename)).toBeTruthy()

    // clean up, maybe should be done in afterEach to account for async?
    fs.unlinkSync(pathToFile)
  })

  it('partially applied saveProduct works like _saveProduct', () => {
    const filename = '100000-save-me-prod.json'
    const pathToFile = `${dataDir}/prods/${filename}`
    const productToSave = {
      id: 100000,
      name: 'save me',
      filename,
      validationSummary: {}
    }

    saveProduct(dataDir, productToSave)

    const prodFilenames = fs.readdirSync(`${dataDir}/prods`)
    expect(prodFilenames.includes(filename)).toBeTruthy()

    // clean up, maybe should be done in afterEach to account for async?
    fs.unlinkSync(pathToFile)
  })

  it('saveAllProducts saves all prods to prods.all.json', () => {
    const prods = loadAllProducts(dataDir)
    const filename = 'prods.all.json'
    const sampleProduct = _.sample(prods)

    const randomProduct = element => _.isEqual(element, sampleProduct)

    saveAllProducts(dataDir, prods)

    const productsReloaded = jsonfile.readFileSync(`${dataDir}/${filename}`)
    const filenames = fs.readdirSync(dataDir)

    expect(productsReloaded).toHaveLength(13)
    expect(productsReloaded.find(randomProduct)).toEqual(sampleProduct)
    expect(filenames.includes(filename)).toBeTruthy()

    // clean up, maybe should be done in afterEach to account for async?
    fs.unlinkSync(`${dataDir}/${filename}`)
  })

  it('saveAllProductsToCsv saves prods to prods.all.csv', () => {
    const prods = loadAllProducts(dataDir)
    const filename = 'EDB_Products-Export.csv'
    const fields = [...orderedKeys]

    // calling saveAllProductsToCsv saves the file and returns the csv data
    const result = saveAllProductsToCsv(fields, dataDir, prods)

    const filenames = fs.readdirSync(dataDir)
    const csvReloaded = fs.readFileSync(`${dataDir}/${filename}`, {
      encoding: 'utf8'
    })

    expect(result).toMatchSnapshot()
    expect(filenames.includes(filename)).toBeTruthy()
    expect(csvReloaded).toEqual(result)

    // clean up, maybe should be done in afterEach to account for async?
    fs.unlinkSync(`${dataDir}/${filename}`)
  })
})
