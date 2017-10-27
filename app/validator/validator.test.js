import path from 'path'
import jsonfile from 'jsonfile'
import {pipe} from 'ramda'
import {
  loadProduct,
  loadAllProducts,
  loadNutrs,
  loadNutrChange,
  loadProductSchema,
  removeHelperFields
} from './helpers/helpers'
import {
  orderProcesses,
  orderProduct,
  removeEmptyObjectsFromArrays,
  removeEmptyArrays,
  addValidationSummary,
  schemaValidate,
  addParentProduct,
  fillValidationSummary,
  validateNutritionId,
  validateNutrChangeId,
  classify,
  getFieldFromParent,
  pullFieldsFromParent,
  pullAndAddFieldsFromParent
} from './validator'
import {OPTIONAL_FIELDS_FROM_LINKED_PRODUCT} from './validator'
import {ALL_FIELDS_FROM_LINKED_PRODUCT} from "./validator";

// Point to fake test resources and load some standard resources
const dataDir = path.resolve(`${__dirname}`, './eaternity-edb-data-fake')
const prods = loadAllProducts(dataDir)
const nutrs = loadNutrs(dataDir)
const nutrChange = loadNutrChange(dataDir)
const productSchema = loadProductSchema(dataDir)
const orderedKeys = Object.keys(productSchema.properties)

describe('validator', () => {
  test('_orderProcesses correctly orders processes array', () => {
    const unorderedProduct = jsonfile.readFileSync(
      `${dataDir}/prods/11-unordered-prod.json`
    )
    const orderedProduct = jsonfile.readFileSync(
      `${dataDir}/prods/12-ordered-prod.json`
    )
    const unorderedProcesses = unorderedProduct.processes
    const expectedOrderedProcesses = orderedProduct.processes
    const orderedProcesses = orderProcesses(unorderedProcesses)
    expect(orderedProcesses).toEqual(expectedOrderedProcesses)
  })

  it('orderProduct orders a product according to a list of keys', () => {
    const unorderedProduct = jsonfile.readFileSync(
      `${dataDir}/prods/11-unordered-prod.json`
    )
    const expectedOrderedProduct = jsonfile.readFileSync(
      `${dataDir}/prods/12-ordered-prod.json`
    )
    const orderedProduct = orderProduct(orderedKeys)(unorderedProduct)
    expect(removeHelperFields(orderedProduct)).toEqual(
      removeHelperFields(expectedOrderedProduct)
    )
  })

  test('removeEmptyArrays removes all fields holding []', () => {
    const productWithEmptyArrays = {
      id: 1234,
      name: 'test',
      synonyms: [],
      'co2-value': 42,
      processes: []
    }

    const validateProduct = pipe(
      removeEmptyArrays(orderedKeys),
      // this is just to remove the empty fields
      orderProduct(orderedKeys)
    )

    const result = validateProduct(productWithEmptyArrays)
    expect(result).toMatchSnapshot()
    expect(Object.keys(result).length).toBe(
      Object.keys(productWithEmptyArrays).length - 2
    )
  })

  test('removeEmptyObjectsFromArrays removes [{}]', () => {
    const productWithArrayWithEmptyObject = {
      id: 15,
      processes: [{key: 'value'}, {}]
    }

    const result = removeEmptyObjectsFromArrays(orderedKeys)(
      productWithArrayWithEmptyObject
    )
    expect(result).toMatchSnapshot()
  })

  test('addValidationSummary adds validationSummary to product', () => {
    // define a validationResult
    const expectedValidationSummary = {
      isValid: false,
      parentProduct: '',
      brokenLinks: [],
      missingFields: [],
      missingMandatoryFields: [],
      validationErrors: []
    }

    const someProduct = {
      id: 1,
      name: 'Some product'
    }

    const productWithValidationSummary = addValidationSummary(someProduct)
    const {validationSummary} = productWithValidationSummary

    expect(productWithValidationSummary.id).toEqual(1)
    expect(productWithValidationSummary.name).toEqual('Some product')
    expect(validationSummary).toEqual(expectedValidationSummary)
  })

  test('addValidationSummary does not overwrite existing summary', () => {
    // define a validationResult
    const existingValidationSummary = {
      isValid: false,
      parentProduct: '2-parent-prod.json',
      brokenLinks: ['nutr-change-id'],
      missingFields: ['perishability'],
      validationErrors: []
    }
    const productWithValidationSummary = {
      id: 1,
      name: 'Some product',
      validationSummary: existingValidationSummary
    }
    const validatedProduct = addValidationSummary(productWithValidationSummary)
    const {validationSummary} = validatedProduct
    expect(validationSummary).toEqual(existingValidationSummary)
  })

  test('schemaValidate catches schema errors and adds them to summary', () => {
    const expectedValidationErrors = [
      'instance.synonyms[0] is not of a type(s) string',
      'instance.tags is not of a type(s) string',
      'instance.co2-value is not of a type(s) number'
    ]
    const productWithWrongTypes = jsonfile.readFileSync(
      `${dataDir}/prods/9-wrong-types-prod.json`
    )
    const validatedProductWithWrongTypes = schemaValidate(
      productSchema,
      productWithWrongTypes
    )
    const {validationErrors} = validatedProductWithWrongTypes.validationSummary
    expect(validationErrors).toEqual(expectedValidationErrors)
  })

  it('addParentProduct adds name of parent product to summary', () => {
    const expectedParentProduct = '2-parent-prod.json'
    const pathToChild = `${dataDir}/prods/3-child-prod.json`
    const child = jsonfile.readFileSync(pathToChild)
    const productWithParent = addParentProduct(prods, child)
    const {parentProduct} = productWithParent.validationSummary
    expect(parentProduct).toEqual(expectedParentProduct)
  })

  it('addParentProduct adds name of parent product to summary', () => {
    const expectedParentProduct = '2-parent-prod.json'
    const pathToChild = `${dataDir}/prods/3-child-prod.json`
    const child = loadProduct(pathToChild)
    const productWithParent = addParentProduct(prods, child)
    const {parentProduct} = productWithParent.validationSummary
    expect(parentProduct).toEqual(expectedParentProduct)
  })

  it('addParentProduct adds empty string as parent when not linked', () => {
    const expectedParentProduct = ''
    const pathToGrandParent = `${dataDir}/prods/1-grand-parent-prod.json`
    const grandParent = loadProduct(pathToGrandParent)
    const validatedGrandParent = addParentProduct(prods, grandParent)
    const {parentProduct} = validatedGrandParent.validationSummary
    expect(parentProduct).toEqual(expectedParentProduct)
  })

  it('addParentProduct adds empty string as parent when link broken', () => {
    const expectedParentProduct = ''
    const pathToLonelychild = `${dataDir}/prods/4-lonely-child-prod.json`
    const lonelyChild = loadProduct(pathToLonelychild)
    const validatedLonelyChild = addParentProduct(prods, lonelyChild)
    const {parentProduct} = validatedLonelyChild.validationSummary
    expect(parentProduct).toEqual(expectedParentProduct)
  })

  test('addMissingLinkedFieldsToValidationSummary adds all missing fields', () => {
    const expectedMissingFields = ALL_FIELDS_FROM_LINKED_PRODUCT
    const pathToGrandParent = `${dataDir}/prods/3-child-prod.json`
    const grandParent = loadProduct(pathToGrandParent)
    const validatedGrandParent = fillValidationSummary(grandParent)
    const {missingFields} = validatedGrandParent.validationSummary
    expect(missingFields).toEqual(expectedMissingFields)
  })

  test('addMissingLinkedFieldsToValidationSummary adds nothing when no missing fields', () => {
    const expectedMissingFields = []
    const pathToFullProduct = `${dataDir}/prods/14-full-prod.json`
    const fullProduct = loadProduct(pathToFullProduct)
    const validatedFullProduct = fillValidationSummary(fullProduct)
    const {missingFields} = validatedFullProduct.validationSummary
    expect(missingFields).toEqual(expectedMissingFields)
  })

  test('validateNutritionId finds and adds broken nutrition-id links', () => {
    const expectedBrokenLinks = ['nutrition-id']
    const productWithBrokenNutritionId = jsonfile.readFileSync(
      `${dataDir}/prods/5-broken-nutrition-id-prod.json`
    )
    const validatedProduct = validateNutritionId(
      nutrs,
      productWithBrokenNutritionId
    )

    const {brokenLinks} = validatedProduct.validationSummary
    expect(brokenLinks).toEqual(expectedBrokenLinks)
  })

  test('validateNutritionId adds nothing when nutrition-id missing', () => {
    const expectedBrokenLinks = []
    const productWithNoNutritionId = jsonfile.readFileSync(
      `${dataDir}/prods/3-child-prod.json`
    )
    const validatedProduct = validateNutritionId(
      nutrs,
      productWithNoNutritionId
    )

    const {brokenLinks} = validatedProduct.validationSummary
    expect(brokenLinks).toEqual(expectedBrokenLinks)
  })

  test('validateNutrChangeId finds and adds broken nutr-change links', () => {
    const expectedBrokenLinks = ['nutr-change-id']
    const productWithBrokenNutrChangeId = jsonfile.readFileSync(
      `${dataDir}/prods/6-broken-nutr-change-id-prod.json`
    )
    const validatedProduct = validateNutrChangeId(
      nutrChange,
      productWithBrokenNutrChangeId
    )

    const {brokenLinks} = validatedProduct.validationSummary
    expect(brokenLinks).toEqual(expectedBrokenLinks)
  })

  test('validateNutrChangeId adds nothing when nutr-change-id missing', () => {
    const expectedBrokenLinks = []
    const productWithNoNutrChangeId = jsonfile.readFileSync(
      `${dataDir}/prods/3-child-prod.json`
    )
    const validatedProduct = validateNutrChangeId(
      nutrChange,
      productWithNoNutrChangeId
    )

    const {brokenLinks} = validatedProduct.validationSummary
    expect(brokenLinks).toEqual(expectedBrokenLinks)
  })

  it('classify sets isValid to true if product is valid', () => {
    const pathToFullProduct = `${dataDir}/prods/14-full-prod.json`
    const fullProduct = loadProduct(pathToFullProduct)
    const validateProduct = pipe(
      orderProduct(orderedKeys),
      schemaValidate(productSchema),
      addParentProduct(prods),
      fillValidationSummary,
      validateNutritionId(nutrs),
      validateNutrChangeId(nutrChange),
      classify
    )
    const validatedProduct = validateProduct(fullProduct)
    expect(validatedProduct.validationSummary.isValid).toBeTruthy()
  })

  it('classify throws Error when passed product without summary', () => {
    const pathToProduct = `${dataDir}/prods/3-child-prod.json`
    const productWithoutSummary = loadProduct(pathToProduct)
    const classifyProd = () => classify(productWithoutSummary)
    expect(classifyProd).toThrow(
      'Cannot classify product without validationSummary'
    )
  })

  it('pipe yourself a validator', () => {
    const pathToFullProduct = `${dataDir}/prods/14-full-prod.json`
    const fullProduct = loadProduct(pathToFullProduct)

    const validatorPipeline = pipe(
      schemaValidate(productSchema),
      addParentProduct(prods),
      fillValidationSummary,
      validateNutritionId(nutrs),
      validateNutrChangeId(nutrChange),
      classify
    )

    const expectedValidationSummary = {
      isValid: true,
      parentProduct: '',
      brokenLinks: [],
      missingFields: [],
      missingMandatoryFields: [],
      validationErrors: []
    }

    const validatedProduct = validatorPipeline(fullProduct)
    const {validationSummary} = validatedProduct
    expect(validationSummary).toEqual(expectedValidationSummary)
  })

  it('getFieldFromParent gets field from parent', () => {
    const prods = loadAllProducts(dataDir)
    const field = 'co2-value'
    const pathToParent = `${dataDir}/prods/2-parent-prod.json`
    const parent = loadProduct(pathToParent)
    const expectedReturnValue = {'co2-value': 1}
    const getField = getFieldFromParent(prods)
    const returnValue = getField(parent, field)
    expect(returnValue).toEqual(expectedReturnValue)
  })

  it('getFieldFromParent recursively gets field from grand parent', () => {
    const prods = loadAllProducts(dataDir)
    const field = 'nutrition-id'
    const pathToParent = `${dataDir}/prods/2-parent-prod.json`
    const parent = loadProduct(pathToParent)
    const expectedReturnValue = {'nutrition-id': '1'}
    const getField = getFieldFromParent(prods)
    const returnValue = getField(parent, field)
    expect(returnValue).toEqual(expectedReturnValue)
  })

  it('pullFieldsFromParent pulls all missing fields from parent', () => {
    const prods = loadAllProducts(dataDir)
    const pathToParent = `${dataDir}/prods/2-parent-prod.json`
    const parent = loadProduct(pathToParent)
    const validateParent = pipe(addParentProduct(prods), fillValidationSummary)
    const validatedParent = validateParent(parent)
    const expectedReturnValue = {
      'nutrition-id': '1',
      'season-begin': 'from grandparent',
      'season-end': 'from grandparent'
    }
    const returnValue = pullFieldsFromParent(prods, validatedParent)
    expect(returnValue).toEqual(expectedReturnValue)
  })

  it('pullFieldsFromParent pulls fields from parent and grandparent', () => {
    const prods = loadAllProducts(dataDir)
    const pathToChild = `${dataDir}/prods/3-child-prod.json`
    const child = loadProduct(pathToChild)
    const validateChild = pipe(addParentProduct(prods), fillValidationSummary)
    const validatedChild = validateChild(child)
    const expectedReturnValue = {
      'nutrition-id': '1',
      tags: 'from, parent',
      perishability: 'from parent',
      'co2-value': 1,
      'season-begin': 'from grandparent',
      'season-end': 'from grandparent',
      processes: [{'nutr-change-id': 1, process: 'from parent'}],
      contains: [{
        substance: 'from parent',
        percentage: 4
      }
      ]
    }
    const returnValue = pullFieldsFromParent(prods, validatedChild)
    expect(returnValue).toEqual(expectedReturnValue)
  })

  it('pullAndAddFieldsFromParent pulls and adds fields from summary', () => {
    const prods = loadAllProducts(dataDir)
    const pathToChild = `${dataDir}/prods/3-child-prod.json`
    const child = loadProduct(pathToChild)
    const enhanceChild = pipe(
      addParentProduct(prods),
      fillValidationSummary,
      pullAndAddFieldsFromParent(prods),
      removeHelperFields
    )
    const expectedReturnValue = {
      id: 3,
      name: 'Child',
      'linked-id': '2',
      'nutrition-id': '1',
      tags: 'from, parent',
      perishability: 'from parent',
      'co2-value': 1,
      'season-begin': 'from grandparent',
      'season-end': 'from grandparent',
      processes: [{process: 'from parent', 'nutr-change-id': 1}],
      contains: [{
        substance: 'from parent',
        percentage: 4
      }
      ]
    }
    const returnValue = enhanceChild(child)
    expect(returnValue).toEqual(expectedReturnValue)
  })
})
