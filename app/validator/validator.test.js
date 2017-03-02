import path from 'path'
import jsonfile from 'jsonfile'
import ProductValidator from './validator'

// Point to fake test resources
const dataDir = path.resolve(`${__dirname}`, './eaternity-edb-data-fake')

describe('validator', () => {
  let productValidator = {}
  beforeEach(() => {
    productValidator = new ProductValidator(dataDir)
  })

  it('sets the dataDir correctly', () => {
    expect(productValidator.dataDir).toEqual(dataDir)
  })

  it('loads something', () => {
    // TODO: How to test this better?
    productValidator
      .loadAll()

    expect(productValidator.prodFilenames.length).toBeGreaterThan(0)
    expect(productValidator.nutrsFilenames.length).toBeGreaterThan(0)
    expect(productValidator.nutrChangeFilenames.length).toBeGreaterThan(0)
    expect(productValidator.prods.length).toBeGreaterThan(0)
    expect(productValidator.nutrs.length).toBeGreaterThan(0)
    expect(productValidator.nutrChange.length).toBeGreaterThan(0)
    expect(productValidator.faos.length).toBeGreaterThan(0)
  })

  it('sets single product correctly', () => {
    const fakeProduct = {
      id: 1,
      name: 'Fake'
    }
    productValidator.setProduct(fakeProduct)

    expect(productValidator.product).toEqual(fakeProduct)
  })

  it('adds correct validationSummary field to every product', () => {
    // const validationSummaryKeys = [
    //   'parentProduct',
    //   'hasNutritionId',
    //   'hasNutritionChangeId',
    //   'linkedNutritionIdExists',
    //   'linkedNutritionChangeIdsExist',
    //   'missingFields',
    //   'validationErrors'
    // ]

    const validatedProducts = productValidator
      .loadAll()
      .validateAllProducts()
      .validatedProducts

    const prodsHaveCorrectValidationSummary = validatedProducts.every(prod => {
      return prod.hasOwnProperty('validationSummary')
      // TODO: Why does this fail?
      // && Object.keys(prod.validationSummary) === validationSummaryKeys
    })

    expect(prodsHaveCorrectValidationSummary).toBeTruthy()
  })

  it('detects type errors', () => {
    const expectedValidationErrors = [
      'instance.synonyms[0] is not of a type(s) string',
      'instance.tags is not of a type(s) string',
      'instance.co2-value is not of a type(s) number'
    ]

    const productWithWrongTypes = jsonfile.readFileSync(
      `${dataDir}/prods/9-wrong-types-prod.json`
    )

    const validatedProduct = productValidator
      .loadAll()
      .setProduct(productWithWrongTypes)
      .validateProduct()
      .validatedProduct

    const { validationSummary } = validatedProduct

    expect(expectedValidationErrors).toEqual(validationSummary.validationErrors)
  })
})
