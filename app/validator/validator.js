// let's' try to write the complete validator in functional style
import jsonschema from 'jsonschema'
import {curry} from 'ramda'

// Definition of product fields.

/*
These fields are mandatory and NOT allowed to pull from the linked product.
 */
const UNIQUE_FIELDS = [
  'id',
  'name',
]

/*
These fields are mandatory, but are allowed to pull from the linked product.
 */
const MANDATORY_FIELDS_FROM_LINKED_PRODUCT = [
  'nutrition-id',
  'tags',
  'perishability',
  'co2-value'
]

/*
 These fields are optional, but are allowed to pull from the linked product.
  */
export const OPTIONAL_FIELDS_FROM_LINKED_PRODUCT = [
  'fao-product-id',
  'water-scarcity-footprint-id',
  'waste-id',
  'season-begin',
  'season-end',
  'processes',
  'allergenes',
  'unit-weight',
  'density',
  'contains',
  'production-names',
  'production-values',
  'conservation-names',
  'conservation-values',
  'processing-names',
  'processing-values',
  'packaging-names',
  'packaging-values'
]

/*
Every product which can be exported shall contain this fields
 */
export const MANDATORY_FIELDS = [...UNIQUE_FIELDS, ...MANDATORY_FIELDS_FROM_LINKED_PRODUCT]

/*
All these fields are pulled from the linked product.
 */
export const ALL_FIELDS_FROM_LINKED_PRODUCT = [...MANDATORY_FIELDS_FROM_LINKED_PRODUCT, ...OPTIONAL_FIELDS_FROM_LINKED_PRODUCT]

export const orderProcesses = processes => {
  const keys = ['process', 'nutr-change-id']
  const orderedProcesses = processes.filter(process => process).map(process => {
    const orderedProcess = keys.map(key => {
      return {[key]: process[key]}
    })

    return Object.assign({}, ...orderedProcess)
  })

  return orderedProcesses
}

// TODO this is code duplication with above - how to handle that?
export const orderContains = contains => {
  const keys = ['substance', 'percentage']
  const orderedSubstances = contains.filter(substance => substance).map(substance => {
    const orderedSubstance = keys.map(key => {
      return {[key]: substance[key]}
    })

    return Object.assign({}, ...orderedSubstance)
  })

  return orderedSubstances
}

const _orderProduct = (orderProcesses, orderContains, orderedKeys, product) => {
  const orderedPairs = orderedKeys
    .filter(key => product[key] !== undefined)
    .map(key => {
      if (key === 'processes') {
        return {
          [key]: orderProcesses(product[key])
        }
      } else if (key === 'contains') {
        return {
          [key]: orderContains(product[key])
        }
      } else {
        return {[key]: product[key]}
      }
    })

  const orderedProduct = Object.assign({}, ...orderedPairs)
  return orderedProduct
}

const curriedOrderProduct = curry(_orderProduct)
export const orderProduct = curriedOrderProduct(orderProcesses, orderContains)

const _removeEmptyArrays = (orderedKeys, product) =>
  orderedKeys
    .filter(key => !(Array.isArray(product[key]) && product[key].length === 0))
    .map(key => {
      return {[key]: product[key]}
    })
    .reduce((obj, newField) => Object.assign(obj, newField), {})

export const removeEmptyArrays = curry(_removeEmptyArrays)

const _removeEmptyObjectsFromArrays = (orderedKeys, product) =>
  orderedKeys
    // I really think we should also remove empty strings...
    // .filter(key => product[key] !== '')
    // and empty objects
    // .filter(key => !(Object.keys(product[key]).length === 0 &&
    //    product[key].constructor === Object)
    // remove empty objects from arrays
    .map(key => {
      return Array.isArray(product[key])
        ? {
          [key]: product[key].filter(
              element =>
                // remove emty objects from array
                !(
                  Object.keys(element).length === 0 &&
                  element.constructor === Object
                )
            )
        }
        : {[key]: product[key]}
    })
    .filter(field => field[Object.keys(field)] !== undefined)
    .reduce((obj, newField) => Object.assign(obj, newField), {})

export const removeEmptyObjectsFromArrays = curry(_removeEmptyObjectsFromArrays)

export const addValidationSummary = product => {
  // define a default validationSummary
  const validationSummary = {
    isValid: false,
    parentProduct: '',
    brokenLinks: [],
    missingFields: [],
    missingMandatoryFields: [],
    validationErrors: []
  }
  const hasValidationSummary =
    product.hasOwnProperty('validationSummary') &&
    Object.keys(product.validationSummary).every(key => {
      return Object.keys(validationSummary).includes(key)
    })

  if (!hasValidationSummary) {
    product = {...product, validationSummary}
  }

  return product
}

const _schemaValidate = (jsonschema, addValidationSummary, schema, product) => {
  product = addValidationSummary(product)
  let {validationSummary} = product

  const validationErrors = jsonschema
    .validate(product, schema)
    .errors.map(error => {
      return error.stack
    })

  const hasValidationErrors = validationErrors.length > 0

  if (hasValidationErrors) {
    validationSummary = {...validationSummary, validationErrors}
  }

  return {...product, validationSummary}
}

const curriedSchemaValidate = curry(_schemaValidate)
export const schemaValidate = curriedSchemaValidate(
  jsonschema,
  addValidationSummary
)

const _addParentProduct = (addValidationSummary, prods, product) => {
  product = addValidationSummary(product)
  let {validationSummary} = product

  const isLinked = product.hasOwnProperty('linked-id')

  if (isLinked) {
    const parentName = prods
      .map(product => product.filename)
      .filter(filename => filename.split('-')[0] === product['linked-id'])

    validationSummary = {
      ...validationSummary,
      parentProduct: parentName[0] || ''
    }
  }

  return {...product, validationSummary}
}

const curriedAddParentProduct = curry(_addParentProduct)
export const addParentProduct = curriedAddParentProduct(addValidationSummary)

const _fillValidationSummary = (allFieldsFromLinkedProduct, MANDATORY_FIELDS, product) => {
  product = addValidationSummary(product)
  let {validationSummary} = product

  const missingFields = allFieldsFromLinkedProduct.filter(field => {
    return !product.hasOwnProperty(field)
  })

  const missingMandatoryFields = missingFields.filter(field => {
    return MANDATORY_FIELDS.includes(field)
  })

  const fieldsMissing = missingFields.length > 0
  const mandatoryFieldsMissing = missingMandatoryFields.length > 0

  if (fieldsMissing) {
    validationSummary = {...validationSummary, missingFields}
  }

  if (mandatoryFieldsMissing) {
    validationSummary = {...validationSummary, missingMandatoryFields}
  }

  return {...product, validationSummary}
}

const curriedFillValidationSummary = curry(_fillValidationSummary)
export const fillValidationSummary = curriedFillValidationSummary(
  ALL_FIELDS_FROM_LINKED_PRODUCT,
  MANDATORY_FIELDS
)

const _validateNutritionId = (addValidationSummary, nutrs, product) => {
  product = addValidationSummary(product)
  let {validationSummary} = product
  const {brokenLinks} = validationSummary

  const hasNutritionId = product.hasOwnProperty('nutrition-id')

  if (hasNutritionId) {
    const nutritionId = product['nutrition-id']
    const linkedNutritionIdExists = nutrs.some(nutrObj => {
      return nutrObj.id === nutritionId
    })

    if (!linkedNutritionIdExists) {
      validationSummary = {
        ...validationSummary,
        brokenLinks: [...brokenLinks, 'nutrition-id']
      }
    }
  }

  return {...product, validationSummary}
}

const curriedValidateNutritionId = curry(_validateNutritionId)
export const validateNutritionId = curriedValidateNutritionId(
  addValidationSummary
)

const _validateNutrChangeId = (addValidationSummary, nutrChange, product) => {
  product = addValidationSummary(product)
  let {validationSummary} = product
  const {brokenLinks} = validationSummary

  const hasProcesses = product.hasOwnProperty('processes') && product.processes

  const hasNutritionChangeId = hasProcesses
    ? product.processes.length > 0 &&
      product.processes[0].hasOwnProperty('nutr-change-id')
    : false

  if (hasNutritionChangeId) {
    const {processes} = product
    const allNutritionChangeIds = processes.map(processesObj => {
      return processesObj['nutr-change-id']
    })

    const linkedNutritionChangeIdsExist = allNutritionChangeIds.every(
      nutritionChangeId => {
        return nutrChange.some(nutrChangeObj => {
          return nutrChangeObj.id === nutritionChangeId
        })
      }
    )

    if (!linkedNutritionChangeIdsExist) {
      validationSummary = {
        ...validationSummary,
        brokenLinks: [...brokenLinks, 'nutr-change-id']
      }
    }
  }

  return {...product, validationSummary}
}

const curriedValidateNutritionChangeId = curry(_validateNutrChangeId)
export const validateNutrChangeId = curriedValidateNutritionChangeId(
  addValidationSummary
)

export const classify = product => {
  let {validationSummary} = product

  if (!validationSummary) {
    throw new Error('Cannot classify product without validationSummary')
  }

  const {
    brokenLinks,
    missingMandatoryFields,
    validationErrors
  } = validationSummary
  const hasBrokenLinks = brokenLinks.length > 0
  const hasMissingMandatoryFields = missingMandatoryFields.length > 0
  const hasValidationErrors = validationErrors.length > 0
  const isValid =
    !hasBrokenLinks && !hasMissingMandatoryFields && !hasValidationErrors
  validationSummary = {...validationSummary, isValid}
  return {...product, validationSummary}
}

const _getFieldFromParent = (prods, parentProduct, field) => {
  const validatedParentProduct = addParentProduct(prods, parentProduct)
  const {validationSummary} = validatedParentProduct
  let pulledField = {}

  const fieldExistsInParent = parentProduct.hasOwnProperty(field)
  // parentProduct is '' (falsy) when no linked-id is given or no product with
  // the linked id exists
  const isLinked = validationSummary.parentProduct

  if (fieldExistsInParent) {
    pulledField = {[field]: parentProduct[field]}
  } else if (isLinked) {
    const grandParent = prods.filter(product => {
      return product.filename === validationSummary.parentProduct
    })[0]
    const validatedGrandParent = addParentProduct(prods, grandParent)
    return _getFieldFromParent(prods, validatedGrandParent, field)
  } else {
    pulledField = {[field]: 'NOT_RESOLVABLE'}
  }

  return pulledField
}

export const getFieldFromParent = curry(_getFieldFromParent)

const _pullFieldsFromParent = (getFieldFromParent, prods, validatedProduct) => {
  const {missingFields} = validatedProduct.validationSummary

  const pulledFields = missingFields
    .map(field => getFieldFromParent(prods, validatedProduct, field))
    .filter(field => field[Object.keys(field)] !== 'NOT_RESOLVABLE')
    .reduce((prev, curr) => ({...prev, ...curr}), {})

  return pulledFields
}

const curriedPullFieldsFromParent = curry(_pullFieldsFromParent)
export const pullFieldsFromParent = curriedPullFieldsFromParent(getFieldFromParent)

const _pullAndAddFieldsFromParent = (pullFieldsFromParent, prods, product) => {
  const pulledFields = pullFieldsFromParent(prods, product)
  return {...product, ...pulledFields}
}

const curriedPullAndAddFieldsFromParent = curry(_pullAndAddFieldsFromParent)
export const pullAndAddFieldsFromParent = curriedPullAndAddFieldsFromParent(
  pullFieldsFromParent
)
