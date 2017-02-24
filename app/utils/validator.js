import fs from 'fs'
import jsonfile from 'jsonfile'
import jsonschema from 'jsonschema'

// set indentation for jsonfile
jsonfile.spaces = 2

class ProductValidator {
  constructor (config) {
    this.dataDir = config.dataDir
    this.productSchema = config.productSchema

    this.prodFilenames = fs.readdirSync(`${this.dataDir}/prods`)
    this.nutrsFilenames = fs.readdirSync(`${this.dataDir}/nutrs`)
    this.nutrChangeFilenames = fs.readdirSync(`${this.dataDir}/nutr-change`)

    this.prods = this.prodFilenames
      .filter(filename => {
        // http://regexr.com/ is awesome! Thanks Michi!
        const filenameRegEx = /^\d.+(prod\.json)/g
        return filenameRegEx.test(filename)
      })
      .map(filename => {
        const product = jsonfile.readFileSync(`${this.dataDir}/prods/${filename}`)
        return Object.assign(product, {filename})
      })

    this.nutrs = this.nutrsFilenames.map(filename => {
      return jsonfile.readFileSync(`${this.dataDir}/nutrs/${filename}`)
    })

    this.nutrChange = this.nutrChangeFilenames.map(filename => {
      return jsonfile.readFileSync(`${this.dataDir}/nutr-change/${filename}`)
    })

    this.faos = jsonfile.readFileSync(`${this.dataDir}/fao-product-list.json`)

    this.orderedKeys = [
      ...Object.keys(this.productSchema.properties),
      'filename',
      'validationSummary'
    ]

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

  setProduct (product) {
    this.product = product
    return this
  }

  setProducts (products) {
    this.prods = products
    return this
  }

  orderProduct (product = this.product) {
    const orderProcesses = processes => {
      const keys = ['process', 'nutr-change-id']
      const orderedProcesses = processes.map(process => {
        if (process) {
          const orderedProcess = keys
          .map(key => {
            return {[key]: process[key]}
          })
          .reduce((process, nutrChangeId) => {
            return Object.assign(process, nutrChangeId)
          })

          return orderedProcess
        }
      })
      return orderedProcesses
    }

    const orderedPairs = this.orderedKeys
      .map(key => {
        if (key === 'processes' && product[key]) {
          return {[key]: orderProcesses(product[key])}
        } else {
          return {[key]: product[key]}
        }
      })

    this.orderedProduct = Object.assign({}, ...orderedPairs)
    return this
  }

  orderValidatedProduct (validatedProduct = this.validatedProduct) {
    this.orderedValidatedProduct = this.orderProduct(validatedProduct)
      .orderedProduct

    return this
  }

  orderValidatedProducts (validatedProducts = this.validatedProducts) {
    this.orderedValidatedProducts = validatedProducts.map(product => {
      return this.orderProduct(product).orderedProduct
    })

    return this
  }

  orderFixedProducts (fixedProducts = this.fixedProducts) {
    this.orderedFixedProducts = fixedProducts.map(product => {
      return this.orderProduct(product).orderedProduct
    })

    return this
  }

  saveOrderedValidatedProducts () {
    this.orderedValidatedProducts
      // make a copy before deleting fields!
      .map(product => Object.assign({}, product))
      .forEach(product => {
        const filename = product.filename

        delete product.filename
        delete product.validationSummary

      // write all files separately and overwrite original products
        jsonfile.writeFileSync(`${this.dataDir}/prods/${filename}`, product)
      })

    return this
  }

  saveOrderedFixedProducts () {
    // remove filename and validation Summary from products getting saved to
    // prods.all.json
    // const cleanProducts = this.orderedFixedProducts
    //   .map(product => {
    //     // make a copy before deleting fields!
    //     const cleanProduct = Object.assign({}, product)
    //
    //     delete cleanProduct.filename
    //     delete cleanProduct.validationSummary
    //
    //     return cleanProduct
    //   })

    // write all products to a single file
    // jsonfile.writeFileSync(`${this.dataDir}/prods.all.json`, cleanProducts)

    // write all products to a single file
    jsonfile.writeFileSync(
      `${this.dataDir}/prods.all.json`,
      this.orderedFixedProducts
    )

    return this
  }

  saveValidatedProduct (validatedProduct = this.validatedProduct) {
    // make a copy, before deleting fields
    const cleanProduct = Object.assign({}, validatedProduct)
    const filename = validatedProduct.filename

    delete cleanProduct.filename
    delete cleanProduct.validationSummary

    jsonfile.writeFileSync(
      `${this.dataDir}/prods/${filename}`,
      cleanProduct
    )

    return this
  }

  saveOrderedValidatedProduct (product = this.orderedValidatedProduct) {
    // make a copy, before deleting fields
    const cleanProduct = Object.assign({}, product)
    const filename = product.filename

    delete cleanProduct.filename
    delete cleanProduct.validationSummary

    jsonfile.writeFileSync(
      `${this.dataDir}/prods/${filename}`,
      cleanProduct
    )

    return this
  }

  // method to validate a product
  validateProduct (product = this.product) {
    this.setProduct(product)

    // define a validationResult
    let validationSummary = {
      parentProduct: '',
      hasNutritionId: false,
      hasNutritionChangeId: false,
      linkedNutritionIdExists: false,
      linkedNutritionChangeIdsExist: false,
      missingFields: [],
      validationErrors: []
    }

    // // There should be no schema errors once the json ui schema is
    //  implemented!
    const validationErrors = jsonschema
      .validate(product, this.productSchema).errors.map(error => {
        return error.stack.split('.')[1]
      })

    const hasValidationErrors = validationErrors.length > 0

    if (hasValidationErrors) {
      validationSummary = Object.assign(validationSummary, {validationErrors})
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
    }

    // does a nutrient-id field exist? Is there a corresponding file?
    const hasNutritionId = this.product.hasOwnProperty('nutrition-id')

    if (hasNutritionId) {
      const nutritionId = product['nutrition-id']
      const linkedNutritionIdExists = this.nutrs.some(nutrObj => {
        return nutrObj.id === nutritionId
      })

      if (linkedNutritionIdExists) {
        validationSummary = Object.assign(validationSummary, {
          hasNutritionId,
          linkedNutritionIdExists
        })
      } else {
        validationSummary = Object.assign(validationSummary, {
          hasNutritionId
        })
      }
    }

    // does processes field exist and does it contain nutr-change-id field(s)?
    // For each id, is there a nutr-change file with this id?
    const hasNutritionChangeId = this.product.hasOwnProperty('processes') &&
      this.product.processes[0].hasOwnProperty('nutr-change-id')

    if (hasNutritionChangeId) {
      const processes = this.product.processes
      const allNutritionChangeIds = processes.map(processesObj => {
        return processesObj['nutr-change-id']
      })

      const linkedNutritionChangeIdsExist = allNutritionChangeIds
          .every(nutritionChangeId => {
            return this.nutrChange.some(nutrChangeObj => {
              return nutrChangeObj.id === nutritionChangeId
            })
          })

      if (linkedNutritionChangeIdsExist) {
        validationSummary = Object.assign(validationSummary, {
          hasNutritionChangeId,
          linkedNutritionChangeIdsExist
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

        // calling this.validateProduct(parentProduct) is essential because it
        // sets the parent product as this.validatedProduct in each recursive
        // call...
        const validatedParentProduct = this.validateProduct(parentProduct).validatedProduct

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
    let { validationSummary } = validatedProduct
    const { validationErrors } = validationSummary
    let isValid = true
    let brokenLinks = []
    const fieldsFromParent = this.getFieldsFromParent(validatedProduct)

    // check for unresolvable fields
    const unresolvableFields = fieldsFromParent
      .filter(field => {
        // get only keys for validation summary
        const key = Object.keys(field)[0]
        return field[key] === 'NOT_RESOLVABLE'
      })
      .map(field => Object.keys(field)[0])

    const resolvedFields = fieldsFromParent
      .filter(field => {
        const key = Object.keys(field)
        return field[key] !== 'NOT_RESOLVABLE'
      })

    const unresolvableMandatoryFields = unresolvableFields.filter(field => {
      return this.mandatoryFields.includes(field)
    })

    // Array.some() resolves to true if the callback returns true for any
    // of the arrays elements...
    const hasUnresolvableMandatoryFields = unresolvableMandatoryFields
      .length > 0

    if (hasUnresolvableMandatoryFields) {
      isValid = false
    }

    // check for broken links
    if (validationSummary.hasNutritionId &&
      !validationSummary.linkedNutritionIdExists) {
      brokenLinks = [...brokenLinks, 'nutrition-id']
    } else if (validationSummary.hasNutritionChangeId &&
      !validationSummary.linkedNutritionChangeIdsExist) {
      brokenLinks = [...brokenLinks, 'nutr-change-id']
    }

    const hasBrokenLinks = brokenLinks.length > 0

    if (hasBrokenLinks) {
      isValid = false
    }

    const hasValidationErrors = validationErrors.length > 0

    if (hasValidationErrors) {
      isValid = false
    }

    validationSummary = Object.assign({}, {
      isValid,
      brokenLinks,
      missingFields: unresolvableMandatoryFields,
      validationErrors
    })

    this.fixedProduct = Object.assign(validatedProduct, ...resolvedFields, {
      validationSummary
    })

    return this
  }

  validateAllProducts (products = this.prods) {
    this.validatedProducts = products.map(product => {
      return this.validateProduct(product).validatedProduct
    })

    return this
  }

  fixAllProducts (validatedProducts = this.validatedProducts) {
    this.fixedProducts = validatedProducts.map(validatedProduct => {
      return this.fixProduct(validatedProduct).fixedProduct
    })

    return this
  }
}

export default ProductValidator
