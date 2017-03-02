import fs from 'fs'
import jsonfile from 'jsonfile'
import jsonschema from 'jsonschema'

// set indentation for jsonfile
jsonfile.spaces = 2

class ProductValidator {
  constructor (dataDir) {
    this.dataDir = dataDir

    this.productSchema = jsonfile.readFileSync(`${dataDir}/prod.schema.json`)

    this.orderedKeys = [
      ...Object.keys(this.productSchema.properties),
      'filename',
      'validationSummary'
    ]

    this.mandatoryFields = [
      'name',
      'id',
      'nutrition-id',
      'tags',
      'perishability',
      'co2-value'
    ]

    // these optional fields will be pulled from parent if possible
    this.optionalFields = [
      'fao-product-id',
      'waste-id',
      'season-begin',
      'season-end',
      'processes',
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

    // concat all fields
    this.allFields = this.mandatoryFields.concat(this.optionalFields)
  }

  loadAll (dataDir = this.dataDir) {
    this.prodFilenames = fs.readdirSync(`${dataDir}/prods`)
      .filter(filename => {
        // http://regexr.com/ is awesome! Thanks Michi!
        const filenameRegEx = /^\d.+(prod\.json)/g
        return filenameRegEx.test(filename)
      })

    this.nutrsFilenames = fs.readdirSync(`${dataDir}/nutrs`)

    this.nutrChangeFilenames = fs.readdirSync(`${dataDir}/nutr-change`)

    this.prods = this.prodFilenames
      .map(filename => {
        const product = jsonfile.readFileSync(`${dataDir}/prods/${filename}`)
        return Object.assign({}, product, {filename})
      })

    this.nutrs = this.nutrsFilenames.map(filename => {
      return jsonfile.readFileSync(`${dataDir}/nutrs/${filename}`)
    })

    this.nutrChange = this.nutrChangeFilenames.map(filename => {
      return jsonfile.readFileSync(`${dataDir}/nutr-change/${filename}`)
    })

    this.faos = jsonfile.readFileSync(`${dataDir}/fao-product-list.json`)

    return this
  }

  setProduct (product) {
    this.product = product
    return this
  }

  setProducts (products) {
    this.prods = products
    return this
  }

  // reset product validation
  resetProduct (product = this.product) {
    const resetedProduct = Object.assign({}, product)

    delete resetedProduct.validationSummary

    this.product = resetedProduct

    return this
  }

  orderProduct (product = this.product) {
    const orderProcesses = processes => {
      if (processes.length > 0) {
        const keys = ['process', 'nutr-change-id']
        const orderedProcesses = processes.map(process => {
          const orderedProcess = keys
          .map(key => {
            return {[key]: process[key]}
          })
          .reduce((process, nutrChangeId) => {
            return Object.assign({}, process, nutrChangeId)
          })

          return orderedProcess
        })
        return orderedProcesses
      }
    }

    const orderedPairs = this.orderedKeys
      .map(key => {
        if (key === 'processes' && product.hasOwnProperty(key)) {
          const processesFieldEmpty = product[key].length === 0
          if (!processesFieldEmpty) {
            return {[key]: orderProcesses(product[key])}
          }
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

  saveProduct (product = this.product) {
    const filename = product.filename

    delete product.filename
    delete product.validationSummary

    jsonfile.writeFileSync(`${this.dataDir}/prods/${filename}`, product)
  }

  saveOrderedValidatedProducts () {
    this.orderedValidatedProducts
      // make a copy before deleting fields!
      .map(product => Object.assign({}, product))
      .forEach(product => this.saveProduct(product))

    return this
  }

  saveOrderedFixedProducts (dataDir = this.dataDir) {
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
      `${dataDir}/prods.all.json`,
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
        return error.stack
      })

    const hasValidationErrors = validationErrors.length > 0

    if (hasValidationErrors) {
      validationSummary = Object.assign({},
        validationSummary,
        {validationErrors}
      )
    }

    const missingFields = this.allFields.filter(field => {
      return !product.hasOwnProperty(field)
    })

    const isLinked = product.hasOwnProperty('linked-id')
    const fieldsMissing = missingFields.length > 0

    if (fieldsMissing) {
      validationSummary = Object.assign({},
        validationSummary,
        {missingFields}
      )
    }

    if (isLinked) {
      const parentName = this.prodFilenames.filter(filename => {
        return filename.split('-')[0] === product['linked-id']
      })

      validationSummary = Object.assign({},
        validationSummary,
        {parentProduct: parentName[0]}
      )
    }

    // does a nutrient-id field exist? Is there a corresponding file?

    const hasNutritionId = product.hasOwnProperty('nutrition-id')

    if (hasNutritionId) {
      const nutritionId = product['nutrition-id']
      const linkedNutritionIdExists = this.nutrs.some(nutrObj => {
        return nutrObj.id === nutritionId
      })

      if (linkedNutritionIdExists) {
        validationSummary = Object.assign({},
          validationSummary,
          {hasNutritionId, linkedNutritionIdExists}
        )
      } else {
        validationSummary = Object.assign({},
          validationSummary,
          {hasNutritionId}
        )
      }
    }

    // does processes field exist and does it contain nutr-change-id field(s)?
    // For each id, is there a nutr-change file with this id?

    const hasNutritionChangeId = product.hasOwnProperty('processes') &&
      product.processes.length > 0 &&
      product.processes[0].hasOwnProperty('nutr-change-id')

    if (hasNutritionChangeId) {
      const processes = product.processes
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
        validationSummary = Object.assign({},
          validationSummary,
          {hasNutritionChangeId, linkedNutritionChangeIdsExist}
        )
      } else {
        validationSummary = Object.assign({},
          validationSummary,
          {hasNutritionChangeId}
        )
      }
    }

    const validatedProduct = Object.assign({},
      product,
      {validationSummary}
    )

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

    // deep clone the validatedProduct!
    this.fixedProduct = Object.assign({},
      validatedProduct,
      ...resolvedFields,
      {validationSummary}
    )

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
