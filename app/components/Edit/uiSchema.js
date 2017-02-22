import Oracle from '../Oracle/Oracle'

const uiSchema = {
  'id': {
    'ui:readonly': true
  },
  'name': {
    'ui:widget': 'text'
  },
  'name-english': {
    'ui:widget': 'text'
  },
  'name-french': {
    'ui:widget': 'text'
  },
  'synonyms': {
    'items': {
      'ui:widget': 'text'
    },
    'ui:field': 'synonyms',
    'ui:options': {
      orderable: false,
      removable: false
    }
  },
  'co2-value': {
    'ui:widget': 'text'
  },
  'allergenes': {
    'ui:widget': 'text'
  },
  'tags': {
    'ui:widget': 'text'
  },
  'specification': {
    'ui:widget': 'text'
  },
  'linked-id': {
    'ui:widget': Oracle,
    'ui:options': {
      'dataSelector': 'products',
      'searchFor': 'name',
      'autocomplete': 'id',
      'additionalRenderedFields': [
        'id'
      ]
    }
  },
  'nutrition-id': {
    'ui:widget': Oracle,
    'ui:options': {
      'dataSelector': 'nutrients',
      'searchFor': 'name',
      'autocomplete': 'id',
      'additionalRenderedFields': [
        'id'
      ]
    }
  },
  'waste-id': {
    'ui:widget': 'text'
  },
  'fao-product-id': {
    'ui:widget': Oracle,
    'ui:options': {
      'dataSelector': 'faos',
      'searchFor': 'fao-name',
      'autocomplete': 'fao-code',
      'additionalRenderedFields': [
        'fao-code'
      ]
    }
  },
  'alternatives': {
    'ui:widget': 'text'
  },
  'production-names': {
    'ui:widget': 'text'
  },
  'production-values': {
    'ui:widget': 'text'
  },
  'processing-names': {
    'ui:widget': 'text'
  },
  'processing-values': {
    'ui:widget': 'text'
  },
  'conservation-names': {
    'ui:widget': 'text'
  },
  'conservation-values': {
    'ui:widget': 'text'
  },
  'packaging-names': {
    'ui:widget': 'text'
  },
  'packaging-values': {
    'ui:widget': 'text'
  },
  'season-begin': {
    'ui:widget': 'text'
  },
  'season-end': {
    'ui:widget': 'text'
  },
  'combined-product': {
    'ui:widget': 'select'
  },
  'density': {
    'ui:widget': 'text'
  },
  'unit-weight': {
    'ui:widget': 'text'
  },
  'quantity-comments': {
    'ui:widget': 'textarea'
  },
  'quantity-references': {
    'ui:widget': 'textarea'
  },
  'co2-calculation': {
    'ui:widget': 'textarea'
  },
  'perishability': {
    'ui:widget': 'text'
  },
  'calculation-process-documentation': {
    'ui:widget': 'textarea'
  },
  'info-text': {
    'ui:widget': 'textarea'
  },
  'references': {
    'ui:widget': 'textarea'
  },
  'other-references': {
    'ui:widget': 'textarea'
  },
  'comments': {
    'ui:widget': 'textarea'
  },
  'processes': {
    'items': {
      'ui:widget': 'text',
      'ui:order': ['process', 'nutr-change-id']
    },
    'ui:options': {
      orderable: false
    }
  },
  'co2-calculation-parameters': {
    'ui:widget': 'text'
  },
  'references-parameters': {
    'ui:widget': 'text'
  },
  'data-quality': {
    'ui:widget': 'text'
  },
  'author': {
    'ui:widget': 'text'
  },
  'delete': {
    'ui:widget': 'select'
  }
}

export default uiSchema
