// let's' try to write the complete validator in funvtional style
import jsonschema from 'jsonschema'
import {partial} from '../utils/utils'

const MANDATORY_FIELDS = [
  'id',
  'name',
  'nutrition-id',
  'tags',
  'perishability',
  'co2-value'
]

// these optional fields will be pulled from parent if possible
const OPTIONAL_FIELDS = [
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

const ALL_FIELDS = [...MANDATORY_FIELDS, ...OPTIONAL_FIELDS]

export const _orderProcesses = processes => {
  const keys = ['process', 'nutr-change-id']
  const orderedProcesses = processes.map(process => {
    if (process) {
      const orderedProcess = keys
      .map(key => {
        return {[key]: process[key]}
      })
      .reduce((process, nutrChangeId) => {
        return Object.assign({}, process, nutrChangeId)
      })

      return orderedProcess
    }
  })
  return orderedProcesses
}

const _orderProduct = (_orderProcesses, orderedKeys, product) => {
  const orderedPairs = orderedKeys
    .map(key => {
      if (key === 'processes' && product[key]) {
        return {[key]: _orderProcesses(product[key])}
      } else {
        return {[key]: product[key]}
      }
    })

  const orderedProduct = Object.assign({}, ...orderedPairs)

  return orderedProduct
}

export const orderProduct = partial(_orderProduct, _orderProcesses)

export const addValidationSummary = product => {
  // define a default validationSummary
  const validationSummary = {
    parentProduct: '',
    brokenLinks: [],
    missingFields: [],
    validationErrors: []
  }
  const hasValidationSummary = product.hasOwnProperty('validationSummary') && Object.keys(product.validationSummary).every(key => {
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
    .validate(product, schema).errors.map(error => {
      return error.stack
    })

  const hasValidationErrors = validationErrors.length > 0

  if (hasValidationErrors) {
    validationSummary = {...validationSummary, validationErrors}
  }

  return {...product, validationSummary}
}

export const schemaValidate = partial(
  _schemaValidate,
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

export const addParentProduct = partial(_addParentProduct, addValidationSummary)

const _addMissingFields = (allFields, product) => {
  product = addValidationSummary(product)
  let {validationSummary} = product

  const missingFields = allFields.filter(field => {
    return !product.hasOwnProperty(field)
  })

  const fieldsMissing = missingFields.length > 0

  if (fieldsMissing) {
    validationSummary = {...validationSummary, missingFields}
  }

  return {...product, validationSummary}
}

export const addMissingFields = partial(_addMissingFields, ALL_FIELDS)

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

export const validateNutritionId = partial(
  _validateNutritionId,
  addValidationSummary
)

const _validateNutrChangeId = (addValidationSummary, nutrChange, product) => {
  product = addValidationSummary(product)
  let {validationSummary} = product
  const {brokenLinks} = validationSummary

  const hasNutritionChangeId = product.hasOwnProperty('processes') &&
    product.processes.length > 0 &&
    product.processes[0].hasOwnProperty('nutr-change-id')

  if (hasNutritionChangeId) {
    const {processes} = product
    const allNutritionChangeIds = processes.map(processesObj => {
      return processesObj['nutr-change-id']
    })

    const linkedNutritionChangeIdsExist = allNutritionChangeIds
        .every(nutritionChangeId => {
          return nutrChange.some(nutrChangeObj => {
            return nutrChangeObj.id === nutritionChangeId
          })
        })

    if (!linkedNutritionChangeIdsExist) {
      validationSummary = {
        ...validationSummary,
        brokenLinks: [...brokenLinks, 'nutr-change-id']
      }
    }
  }

  return {...product, validationSummary}
}

export const validateNutrChangeId = partial(
  _validateNutrChangeId,
  addValidationSummary
)

export const getFieldFromParent = (prods, parentProduct, field) => {
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
    return getFieldFromParent(prods, validatedGrandParent, field)
  } else {
    pulledField = {[field]: 'NOT_RESOLVABLE'}
  }

  return pulledField
}

const _pullMissingFields = (getFieldFromParent, prods, validatedProduct) => {
  const {missingFields} = validatedProduct.validationSummary

  const pulledFields = missingFields
    .map(field => getFieldFromParent(prods, validatedProduct, field))
    .filter(field => field[Object.keys(field)] !== 'NOT_RESOLVABLE')
    .reduce((prev, curr) => ({...prev, ...curr}), {})

  return pulledFields
}

export const pullMissingFields = partial(
  _pullMissingFields,
  getFieldFromParent
)

const _pullAndAddMissingFields = (pullMissingFields, prods, product) => {
  const pulledFields = pullMissingFields(prods, product)
  return {...product, ...pulledFields}
}

export const pullAndAddMissingFields = partial(
  _pullAndAddMissingFields,
  pullMissingFields
)
