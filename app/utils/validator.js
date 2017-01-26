import fs from 'fs'
import jsonfile from 'jsonfile'
import path from 'path'

// set indentation for jsonfile
jsonfile.spaces = 2

class ProductValidator {
  constructor () {
    this.mandatoryFields = [
      'name',
      'id',
      'co2-value',
      'nutrition-id',
      'tags'
    ]

    // these optional fields will be oulled from parent if possible
    this.optionalFields = [
      'fao-product-id',
      'production-names',
      'production-values',
      'conservation-names',
      'conservation-values',
      'packaging-names',
      'packaging-values',
      'season-begin',
      'season-end',
      'unit-weight',
      'processes',
      'allergenes',
      'density',
      'alternatives'
    ]

    // concat all fields
    this.allFields = this.mandatoryFields.concat(this.optionalFields)
  }

  // method to set dataDir
  setDataDir (dataDir) {
    this.dataDir = dataDir
    this.prodFilenames = fs.readdirSync(`${this.dataDir}/prods`)
    this.nutrsFilenames = fs.readdirSync(`${this.dataDir}/nutrs`)
    this.nutrChangeFilenames = fs.readdirSync(`${this.dataDir}/nutr-change`)
    this.prods = this.prodFilenames
      .filter(filename => {
        return path.extname(filename) === '.json' &&
        !(filename === 'prod.schema.json')
      })
      .map(filename => {
        const product = jsonfile.readFileSync(`${this.dataDir}/prods/${filename}`)
        return Object.assign(product, {filename})
      })
    this.nutrs = this.nutrsFilenames.map(filename => {
      return jsonfile.readFileSync(`${this.dataDir}/nutrs/${filename}`)
    })

    return this
  }

  setProduct (product) {
    this.product = product
    return this
  }

  saveFixedProducts () {
    jsonfile.writeFileSync(`${this.dataDir}/prods.all.json`, this.fixedProducts)
  }

  // method to validate a product
  validateProduct (product = this.product) {
    this.setProduct(product)

    // define a validationResult
    let validationSummary = {
      parentProduct: '',
      hasNutritionId: false,
      hasNutritionChangeId: false,
      linkedNutritionFileExists: false,
      linkedNutritionChangeFilesExist: false,
      missingFields: []
    }

    const missingFields = this.allFields.filter(field => {
      return !this.product.hasOwnProperty(field)
    })

    const isLinked = this.product.hasOwnProperty('linked-id')
    const fieldsMissing = missingFields.length > 0

    if (fieldsMissing) {
      validationSummary = Object.assign(validationSummary, {missingFields})
    }

    if (isLinked) {
      const parentName = this.prodFilenames.filter(filename => {
        return filename.split('-')[0] === product['linked-id']
      })

      validationSummary = Object.assign(validationSummary, {
        parentProduct: parentName[0]
      })
    } else {
      validationSummary = Object.assign(validationSummary, {
        parentProduct: ''
      })
    }

      // does a nutrient-id field exist? Is there a corresponding file?
    const hasNutritionId = this.product.hasOwnProperty('nutrition-id')

    if (hasNutritionId) {
      const nutritionId = product['nutrition-id']
      const linkedNutritionFileExists = this.nutrs.some(nutrObj => {
        return nutrObj.id === nutritionId
      })

      if (linkedNutritionFileExists) {
        validationSummary = Object.assign(validationSummary, {
          hasNutritionId,
          linkedNutritionFileExists
        })
      } else {
        validationSummary = Object.assign(validationSummary, {
          hasNutritionId
        })
      }
    }

    // does processes field exist and does it contain nutr-change-id field(s)?
    // Is there a corresponding nutr-change file for each?
    const hasNutritionChangeId = this.product.hasOwnProperty('processes') &&
      this.product.processes[0].hasOwnProperty('nutr-change-id')
    const allNutritionChangeIds = this.nutrChangeFilenames.map(filename => {
      return filename.split('-')[0]
    })

    if (hasNutritionChangeId) {
      const processes = this.product.processes
      const nutritionChangeIds = processes.map(processesObj => {
        return processesObj['nutr-change-id']
      })

      const linkedNutritionChangeFilesExist = nutritionChangeIds
          .every(nutritionChangeId => {
            return allNutritionChangeIds.includes(nutritionChangeId.toString())
          })

      if (linkedNutritionChangeFilesExist) {
        validationSummary = Object.assign(validationSummary, {
          hasNutritionChangeId,
          linkedNutritionChangeFilesExist
        })
      } else {
        validationSummary = Object.assign(validationSummary, {
          hasNutritionChangeId
        })
      }
    }

    const validatedProduct = Object.assign(this.product, {validationSummary})

    this.validatedProduct = validatedProduct

    return this
  }

  getFieldsFromParent (validatedProduct) {
    const validationSummary = validatedProduct.validationSummary
    const missingFields = validationSummary.missingFields

    const getFieldFromParent = (parent, missingField) => {
      const validationSummaryParent = parent.validationSummary
      const isLinked = !!validationSummaryParent.parentProduct

      if (isLinked) {
        const parentProduct = this.prods.filter(product => {
          return product.filename === validationSummaryParent.parentProduct
        })[0]

        this.validateProduct(parentProduct)
        const validatedParentProduct = this.validatedProduct

        const fieldExistsInParent = parentProduct.hasOwnProperty(missingField)

        if (fieldExistsInParent) {
          return {
            [missingField]: parentProduct[missingField]
          }
        } else {
          return getFieldFromParent(validatedParentProduct, missingField)
        }
      } else {
        return {
          [missingField]: 'NOT_RESOLVABLE'
        }
      }
    }

    return missingFields.map(missingField => {
      return getFieldFromParent(validatedProduct, missingField)
    })
  }

  fixProduct (validatedProduct = this.validatedProduct) {
    let validationSummary = validatedProduct.validationSummary
    const fieldsFromParent = this.getFieldsFromParent(validatedProduct)

    // get only keys for validation summary
    const unresolvableFields = fieldsFromParent
      .filter(field => {
        const key = Object.keys(field)[0]
        return field[key] === 'NOT_RESOLVABLE'
      })
      .map(field => Object.keys(field)[0])

    const resolvedFields = fieldsFromParent
      .filter(field => {
        const key = Object.keys(field)
        return field[key] !== 'NOT_RESOLVABLE'
      })

    let isValid = unresolvableFields.every(field => {
      return !this.mandatoryFields.includes(field)
    })

    let brokenLinks = ''
    if (validationSummary.hasNutritionId &&
      !validationSummary.linkedNutritionFileExists) {
      brokenLinks = brokenLinks.concat(['nutrition-id'])
    } else if (validationSummary.hasNutritionChangeId &&
      !validationSummary.linkedNutritionChangeFilesExist) {
      brokenLinks = brokenLinks.concat(['nutr-change-id'])
    }

    const hasBrokenLinks = brokenLinks.length > 0

    if (hasBrokenLinks) {
      isValid = false
    }

    validationSummary = Object.assign({}, {
      isValid,
      brokenLinks,
      // use only the keys for the summary
      missingFields: unresolvableFields
    })

    this.fixedProduct = Object.assign(validatedProduct, ...resolvedFields, {
      validationSummary
    })

    return this
  }

  validateAllProducts (prods = this.prods) {
    this.validatedProducts = prods.map(product => {
      this.validateProduct(product)
      return this.validatedProduct
    })

    return this
  }

  fixAllProducts (validatedProducts = this.validatedProducts) {
    this.fixedProducts = validatedProducts.map(validatedProduct => {
      this.fixProduct(validatedProduct)
      return this.fixedProduct
    })

    return this
  }
}

export default ProductValidator
