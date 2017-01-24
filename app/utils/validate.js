const validateProduct = (prodFilenames, nutr, nutrChangeFilenames, product) => {
  // minimum required fields
  const mandatory = [
    'name',
    'id',
    'co2-value',
    'nutrition-id',
    'tags'
  ]

  // pull these optional fields from parent if present
  const optional = [
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

  let validationResult = {
    file: '',
    status: '',
    parentProduct: '',
    hasNutritionId: false,
    hasNutritionChangeId: false,
    linkedNutritionFileExists: false,
    linkedNutritionChangeFilesExist: false,
    missingFields: []
  }

  // test for missing fields
  const allFields = mandatory.concat(optional)

  const missingFields = allFields.filter(field => {
    return !product.hasOwnProperty(field)
  })

  const missingMandatory = missingFields
    .filter(missingField => {
      return mandatory.includes(missingField)
    })

  const missingOptional = missingFields
    .filter(missingField => {
      return optional.includes(missingField)
    })

  const isLinked = product.hasOwnProperty('linked-id')
  const mandatoryMissing = missingMandatory.length > 0
  const optionalMissing = missingOptional.length > 0

  if (mandatoryMissing && !isLinked) {
    validationResult = Object.assign(validationResult, {
      file: product.filename,
      status: 'broken',
      missingFields
    })
  } else if ((mandatoryMissing || optionalMissing) && isLinked) {
    const parentName = prodFilenames.filter(filename => {
      return filename.split('-')[0] === product['linked-id']
    })
    validationResult = Object.assign(validationResult, {
      file: product.filename,
      status: 'fixable',
      parentProduct: parentName[0],
      missingFields
    })
  } else {
    validationResult = Object.assign(validationResult, {
      file: product.filename,
      status: 'valid',
      missingFields
    })
  }

  // does a nutrient-id field exist? Is there a corresponding file?
  const hasNutritionId = product.hasOwnProperty('nutrition-id')

  if (hasNutritionId) {
    const nutritionId = product['nutrition-id']
    const linkedNutritionFileExists = nutr.some(nutrObj => {
      return nutrObj.id === nutritionId
    })

    if (linkedNutritionFileExists) {
      validationResult = Object.assign(validationResult, {
        hasNutritionId,
        linkedNutritionFileExists
      })
    } else {
      validationResult = Object.assign(validationResult, {
        status: 'broken',
        hasNutritionId
      })
    }
  }

  // does processes field exist and does it contain nutr-change-id field(s)?
  // Is there a corresponding nutr-change file for each?
  const hasNutritionChangeId = product.hasOwnProperty('processes') && product.processes[0].hasOwnProperty('nutr-change-id')
  const allNutritionChangeIds = nutrChangeFilenames.map(filename => {
    return filename.split('-')[0]
  })

  if (hasNutritionChangeId) {
    const processes = product.processes
    const nutritionChangeIds = processes.map(processesObj => {
      return processesObj['nutr-change-id']
    })

    const linkedNutritionChangeFilesExist = nutritionChangeIds
      .every(nutritionChangeId => {
        return allNutritionChangeIds.includes(nutritionChangeId.toString())
      })

    if (linkedNutritionChangeFilesExist) {
      validationResult = Object.assign(validationResult, {
        hasNutritionChangeId,
        linkedNutritionChangeFilesExist
      })
    } else {
      validationResult = Object.assign(validationResult, {
        status: 'broken',
        hasNutritionChangeId
      })
    }
  }

  return validationResult
}

export default validateProduct
