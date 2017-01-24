import validateProduct from './validate'

const fix = (prods, nutr, nutrChangeFilenames, validationResult, product) => {
  // define vars
  const unresolvableMandatoryFields = []
  const unresolvableOptionalFields = []
  const prodFilenames = prods.map(product => product.filename)
  let missing = {}
  const mandatory = [
    'name',
    'id',
    'co2-value',
    'nutrition-id',
    'tags',
    'perishability'
  ]
  let summary = {
    hasNutritionId: validationResult.hasNutritionId,
    hasNutritionChangeId: validationResult.hasNutritionChangeId,
    linkedNutritionFileExists: validationResult.linkedNutritionFileExists,
    linkedNutritionChangeFilesExist: validationResult.linkedNutritionChangeFilesExist,
    missingFields: validationResult.missingFields
  }

  const getMissingData = (result, missingData) => {
    const parentProduct = prods.filter(product => {
      return product.filename === result.parentProduct
    })[0]

    const validationResultParent = validateProduct(
      prodFilenames,
      nutr,
      nutrChangeFilenames,
      parentProduct)

    // copy all missing fields from parentProduct if present
    result.missingFields.forEach(missingField => {
      const fieldExistsInParent = parentProduct.hasOwnProperty(missingField)
      const parentProductIsLinked = parentProduct.hasOwnProperty('linked-id')

      if (fieldExistsInParent) {
        missingData = Object.assign(missingData, {
          [missingField]: parentProduct[missingField]
        })
        // yeah I am mutating stuff
        const newMissing = summary.missingFields
        delete newMissing[missingField]
        summary = Object.assign(summary, {missingFields: newMissing})
      } else if (!parentProductIsLinked) {
        missingData = Object.assign(missingData, {
          [missingField]: 'NOT_RESOLVABLE'
        })
      }
    })

    let unresolved = validationResult.missingFields.length - Object.keys(missingData).length

    while (unresolved > 0) {
      // console.log('i hate recursion')
      getMissingData(validationResultParent, missingData)
      unresolved--
      return missingData
    }

    return missingData
  }

  // add isValid field to all products
  switch (validationResult.status) {
    case 'broken':
      product = Object.assign(product, {
        validationResult: {
          isValid: false,
          summary
        }
      })
      break
    case 'valid':
      product = Object.assign(product, {
        validationResult: {
          isValid: true,
          summary
        }
      })
      break
    case 'fixable':
      // iterate over missing Data and add to product
      missing = getMissingData(validationResult, missing)

      Object.keys(missing).forEach(key => {
        const value = missing[key]
        const isMandatory = mandatory.includes(key)

        if (isMandatory && value === 'NOT_RESOLVABLE') {
          unresolvableMandatoryFields.push(key)
          product = Object.assign(product, {
            validationResult: {
              isValid: false,
              summary
            }
          })
          delete missing[key]
        } else if (value === 'NOT_RESOLVABLE') {
          unresolvableOptionalFields.push(key)
          product = Object.assign(product, {
            validationResult: {
              isValid: true,
              summary
            }
          })
          delete missing[key]
        }
      })
      break
  }

  // merge and return fixed Product
  return Object.assign(product, missing)
}

export default fix
