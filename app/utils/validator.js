import fs from 'fs'
import jsonfile from 'jsonfile'

// set indentation for jsonfile
jsonfile.spaces = 2

class ProductValidator {
  constructor () {
    this.orderedKeys = [
      'id',
      'name',
      'linked-id', // added by mcmunder
      'fao-product-id', // added by mcmunder
      'co2-value',
      'tags',
      'specification',
      'synonyms',
      'name-english',
      'name-french',
      'nutrition-id',
      'alternatives',
      'production-names',
      'production-values',
      'processing-names',
      'processing-values',
      'conservation-names',
      'conservation-values',
      'packaging-names',
      'packaging-values',
      'season-begin',
      'season-end',
      'combined-product',
      'density',
      'unit-weight',
      'quantity-comments',
      'quantity-references',
      'foodwaste',
      'foodwaste-comment',
      'co2-calculation',
      'calculation-process-documentation',
      'info-text',
      'references',
      'other-references',
      'comments',
      'co2-calculation-parameters',
      'references-parameters',
      'data-quality',
      'author',
      'delete',
      'allergenes', // added by mcmunder
      'processes', // added by mcmunder
      'waste-id', // added by mcmunder
      'filename', // delete later
      'validationSummary' // delete later
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

  // method to set dataDir
  setDataDir (dataDir) {
    this.dataDir = dataDir
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

    return this
  }

  setProduct (product) {
    this.product = product
    return this
  }

  orderProduct (product = this.product) {
    const orderedPairs = this.orderedKeys
      .filter(key => !(product[key] === ''))
      .map(key => ({[key]: product[key]}))

    this.orderedProduct = Object.assign({}, ...orderedPairs)

    return this
  }

  orderFixedProducts (fixedProducts = this.fixedProducts) {
    this.orderedFixedProducts = fixedProducts.map(product => {
      // delete product.filename
      // delete product.validationSummary
      return this.orderProduct(product).orderedProduct
    })

    return this
  }

  saveOrderedFixedProducts () {
    // Overwrite original products
    this.fixedProducts.forEach(product => {
      const filename = product.filename

      // remove filename and validationSummary fields
      delete product.filename
      delete product.validationSummary

      const orderedProduct = this.orderProduct(product).orderedProduct

      jsonfile.writeFileSync(`${this.dataDir}/prods/${filename}`, orderedProduct)
    })

    // write all products in a single file
    jsonfile.writeFileSync(`${this.dataDir}/prods.all.json`,
      this.orderedFixedProducts)

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
              // console.log(nutrChangeObj.id, nutritionChangeId)
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
    let validationSummary = validatedProduct.validationSummary
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

    validationSummary = Object.assign({}, {
      isValid,
      brokenLinks,
      missingFields: unresolvableMandatoryFields
    })

    this.fixedProduct = Object.assign(validatedProduct, ...resolvedFields, {
      validationSummary
    })

    return this
  }

  validateAllProducts (prods = this.prods) {
    this.validatedProducts = prods.map(product => {
      return this.validateProduct(product).validatedProduct
    })

    return this
  }

  fixAllProducts (validatedProducts = this.validatedProducts) {
    this.fixedProducts = validatedProducts.map(validatedProduct => {
      // console.log(this.fixProduct(validatedProduct).fixedProduct)
      return this.fixProduct(validatedProduct).fixedProduct
    })

    return this
  }
}

export default ProductValidator
