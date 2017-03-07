import path from 'path'
import jsonfile from 'jsonfile'
import {partial, pipe} from '../utils/utils'
import {
  loadProduct,
  loadAllProducts,
  loadNutrs,
  loadNutrChange,
  loadProductSchema,
  removeHelperFields
} from './helpers/helpers'
import {
  _orderProcesses,
  orderProduct,
  addValidationSummary,
  schemaValidate,
  addParentProduct,
  addMissingFields,
  validateNutritionId,
  validateNutrChangeId,
  getFieldFromParent,
  pullMissingFields,
  pullAndAddMissingFields
} from './validator'

// Point to fake test resources
const dataDir = path.resolve(`${__dirname}`, './eaternity-edb-data-fake')

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
    const orderedProcesses = _orderProcesses(unorderedProcesses)
    expect(orderedProcesses).toEqual(expectedOrderedProcesses)
  })

  test('orderProduct orders a product according to a list of keys', () => {
    const productSchema = jsonfile.readFileSync(`${dataDir}/prod.schema.json`)
    const orderedKeys = Object.keys(productSchema.properties)
    const unorderedProduct = jsonfile.readFileSync(
      `${dataDir}/prods/11-unordered-prod.json`
    )
    const expectedOrderedProduct = jsonfile.readFileSync(
      `${dataDir}/prods/12-ordered-prod.json`
    )
    const orderedProduct = orderProduct(orderedKeys, unorderedProduct)
    expect(orderedProduct).toEqual(expectedOrderedProduct)
  })

  test('addValidationSummary adds validationSummary to product', () => {
    // define a validationResult
    const expectedValidationSummary = {
      parentProduct: '',
      brokenLinks: [],
      missingFields: [],
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
    const productSchema = jsonfile.readFileSync(`${dataDir}/prod.schema.json`)
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
    const prods = loadAllProducts(dataDir)
    const expectedParentProduct = '2-parent-prod.json'
    const pathToChild = `${dataDir}/prods/3-child-prod.json`
    const child = jsonfile.readFileSync(pathToChild)
    const productWithParent = addParentProduct(prods, child)
    const {parentProduct} = productWithParent.validationSummary
    expect(parentProduct).toEqual(expectedParentProduct)
  })

  it('addParentProduct adds name of parent product to summary', () => {
    const prods = loadAllProducts(dataDir)
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
    const prods = loadAllProducts(dataDir)
    const validatedGrandParent = addParentProduct(prods, grandParent)
    const {parentProduct} = validatedGrandParent.validationSummary
    expect(parentProduct).toEqual(expectedParentProduct)
  })

  it('addParentProduct adds empty string as parent when link broken', () => {
    const expectedParentProduct = ''
    const pathToLonelychild = `${dataDir}/prods/4-lonely-child-prod.json`
    const lonelyChild = loadProduct(pathToLonelychild)
    const prods = loadAllProducts(dataDir)
    const validatedLonelyChild = addParentProduct(prods, lonelyChild)
    const {parentProduct} = validatedLonelyChild.validationSummary
    expect(parentProduct).toEqual(expectedParentProduct)
  })

  test('addMissingFields adds all missing fields', () => {
    const expectedMissingFields = [
      'fao-product-id',
      'waste-id',
      'allergenes',
      'unit-weight',
      'density',
      'production-names',
      'production-values',
      'conservation-names',
      'conservation-values',
      'processing-names',
      'processing-values',
      'packaging-names',
      'packaging-values'
    ]
    const pathToGrandParent = `${dataDir}/prods/1-grand-parent-prod.json`
    const grandParent = loadProduct(pathToGrandParent)
    const validatedGrandParent = addMissingFields(grandParent)
    const {missingFields} = validatedGrandParent.validationSummary
    expect(missingFields).toEqual(expectedMissingFields)
  })

  test('addMissingFields adds nothing when no missing fields', () => {
    const expectedMissingFields = []
    const pathToFullProduct = `${dataDir}/prods/14-full-prod.json`
    const fullProduct = loadProduct(pathToFullProduct)
    const validatedFullProduct = addMissingFields(fullProduct)
    const {missingFields} = validatedFullProduct.validationSummary
    expect(missingFields).toEqual(expectedMissingFields)
  })

  test('validateNutritionId finds and adds broken nutrition-id links', () => {
    const expectedBrokenLinks = ['nutrition-id']
    const nutrs = loadNutrs(dataDir)
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
    const nutrs = loadNutrs(dataDir)
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
    const nutrChange = loadNutrChange(dataDir)
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
    const nutrChange = loadNutrChange(dataDir)
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

  it('pipe yourself a validator', () => {
    const prods = loadAllProducts(dataDir)
    const nutrs = loadNutrs(dataDir)
    const nutrChange = loadNutrChange(dataDir)
    const productSchema = loadProductSchema(dataDir)

    const validatorPipeline = pipe(
      partial(schemaValidate, productSchema),
      partial(addParentProduct, prods),
      addMissingFields,
      partial(validateNutritionId, nutrs),
      partial(validateNutrChangeId, nutrChange)
    )

    const expectedValidationSummary = {
      parentProduct: '1-grand-parent-prod.json',
      brokenLinks: [],
      missingFields: [
        'nutrition-id',
        'fao-product-id',
        'waste-id',
        'season-begin',
        'season-end',
        'allergenes',
        'unit-weight',
        'density',
        'production-names',
        'production-values',
        'conservation-names',
        'conservation-values',
        'processing-names',
        'processing-values',
        'packaging-names',
        'packaging-values'
      ],
      validationErrors: []
    }
    const parentProduct = jsonfile.readFileSync(
      `${dataDir}/prods/2-parent-prod.json`
    )
    const validatedParentProduct = validatorPipeline(parentProduct)
    const {validationSummary} = validatedParentProduct
    expect(validationSummary).toEqual(expectedValidationSummary)
  })

  it('getFieldFromParent gets field from parent', () => {
    const prods = loadAllProducts(dataDir)
    const field = 'co2-value'
    const pathToParent = `${dataDir}/prods/2-parent-prod.json`
    const parent = loadProduct(pathToParent)
    const expectedReturnValue = {'co2-value': 1}
    const getField = partial(getFieldFromParent, prods)
    const returnValue = getField(parent, field)
    expect(returnValue).toEqual(expectedReturnValue)
  })

  it('getFieldFromParent recursively gets field from grand parent', () => {
    const prods = loadAllProducts(dataDir)
    const field = 'nutrition-id'
    const pathToParent = `${dataDir}/prods/2-parent-prod.json`
    const parent = loadProduct(pathToParent)
    const expectedReturnValue = {'nutrition-id': '1'}
    const getField = partial(getFieldFromParent, prods)
    const returnValue = getField(parent, field)
    expect(returnValue).toEqual(expectedReturnValue)
  })

  it('pullMissingFields pulls all missing fields from parent', () => {
    const prods = loadAllProducts(dataDir)
    const pathToParent = `${dataDir}/prods/2-parent-prod.json`
    const parent = loadProduct(pathToParent)
    const validateParent = pipe(
      partial(addParentProduct, prods),
      addMissingFields,
    )
    const validatedParent = validateParent(parent)
    const expectedReturnValue = {
      'nutrition-id': '1',
      'season-begin': 'from grandparent',
      'season-end': 'from grandparent'
    }
    const returnValue = pullMissingFields(prods, validatedParent)
    expect(returnValue).toEqual(expectedReturnValue)
  })

  it('pullMissingFields pulls fields from parent and grandparent', () => {
    const prods = loadAllProducts(dataDir)
    const pathToChild = `${dataDir}/prods/3-child-prod.json`
    const child = loadProduct(pathToChild)
    const validateChild = pipe(
      partial(addParentProduct, prods),
      addMissingFields,
    )
    const validatedChild = validateChild(child)
    const expectedReturnValue = {
      'nutrition-id': '1',
      'tags': 'from, parent',
      'perishability': 'from parent',
      'co2-value': 1,
      'season-begin': 'from grandparent',
      'season-end': 'from grandparent',
      'processes': [
        {'nutr-change-id': 1, 'process': 'from parent'}
      ]
    }
    const returnValue = pullMissingFields(prods, validatedChild)
    expect(returnValue).toEqual(expectedReturnValue)
  })

  it('pullAndAddMissingFields pulls and adds fields from summary', () => {
    const prods = loadAllProducts(dataDir)
    const pathToChild = `${dataDir}/prods/3-child-prod.json`
    const child = loadProduct(pathToChild)
    const enhanceChild = pipe(
      partial(addParentProduct, prods),
      addMissingFields,
      partial(pullAndAddMissingFields, prods),
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
      processes: [
        {process: 'from parent', 'nutr-change-id': 1}
      ]
    }
    const returnValue = enhanceChild(child)
    expect(returnValue).toEqual(expectedReturnValue)
  })
})
