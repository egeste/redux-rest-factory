/* eslint max-statements: 0 */
export default class ActionReducerFactory {
  apiSpec = {
    read: ((token, pathname, id) => throw new Error '`read` method not provided')
    create: ((token, pathname, item) => throw new Error '`create` method not provided')
    update: ((token, pathname, item) => throw new Error '`update` method not provided')
    delete: ((token, pathname, item) => throw new Error '`delete` method not provided')
  }

  constructor(apiSpec) {
    this.apiSpec = { ...this.apiSpec, ...apiSpec }
  }

  createActions = (pathname, singular, plural) => {
    let actions = {}

    const pluralLower = plural.toLowerCase()
    const singularLower = singular.toLowerCase()

    const pluralReadAction = (`read_${plural}`).toUpperCase()
    const pluralReadSuccessAction = (`${plural}_read`).toUpperCase()
    const pluralReadFailureAction = (`${plural}_read_fail`).toUpperCase()

    const singleCreateAction = (`create_${singular}`).toUpperCase()
    const singleCreateSuccessAction = (`${singular}_create`).toUpperCase()
    const singleCreateFailureAction = (`${singular}_create_fail`).toUpperCase()

    const singleReadAction = (`read_${singular}`).toUpperCase()
    const singleReadSuccessAction = (`${singular}_read`).toUpperCase()
    const singleReadFailureAction = (`${singular}_read_fail`).toUpperCase()

    const singleUpdateAction = (`update_${singular}`).toUpperCase()
    const singleUpdateSuccessAction = (`${singular}_update`).toUpperCase()
    const singleUpdateFailureAction = (`${singular}_update_fail`).toUpperCase()

    const singleDeleteAction = (`delete_${singular}`).toUpperCase()
    const singleDeleteSuccessAction = (`${singular}_delete`).toUpperCase()
    const singleDeleteFailureAction = (`${singular}_delete_fail`).toUpperCase()

    actions[pluralReadAction] = pluralReadAction
    actions[pluralReadSuccessAction] = pluralReadSuccessAction
    actions[pluralReadFailureAction] = pluralReadFailureAction

    actions[singleCreateAction] = singleCreateAction
    actions[singleCreateSuccessAction] = singleCreateSuccessAction
    actions[singleCreateFailureAction] = singleCreateFailureAction

    actions[singleReadAction] = singleReadAction
    actions[singleReadSuccessAction] = singleReadSuccessAction
    actions[singleReadFailureAction] = singleReadFailureAction

    actions[singleUpdateAction] = singleUpdateAction
    actions[singleUpdateSuccessAction] = singleUpdateSuccessAction
    actions[singleUpdateFailureAction] = singleUpdateFailureAction

    actions[singleDeleteAction] = singleDeleteAction
    actions[singleDeleteSuccessAction] = singleDeleteSuccessAction
    actions[singleDeleteFailureAction] = singleDeleteFailureAction

    actions[`read${plural}`] = (token, modifyRequest) => {
      return dispatch => {
        dispatch({ type: pluralReadAction })

        const requestSpec = this.apiSpec.read(token, pathname)
        if (typeof modifyRequest === 'function') modifyRequest(requestSpec)

        return requestSpec.then(items => {
          dispatch({ type: pluralReadSuccessAction, [pluralLower]: items })
          return items
        }).catch(error => {
          dispatch({ type: pluralReadFailureAction, error })
          return error
        })
      }
    }

    actions[`create${singular}`] = (token, item, modifyRequest) => {
      return dispatch => {
        dispatch({ type: singleCreateAction, [singularLower]: item })

        const requestSpec = this.apiSpec.create(token, pathname, item)
        if (typeof modifyRequest === 'function') modifyRequest(requestSpec)

        return requestSpec.then(item => {
          dispatch({ type: singleCreateSuccessAction, [singularLower]: item })
          return item
        }).catch(error => {
          dispatch({ type: singleCreateFailureAction, error })
          return error
        })
      }
    }

    actions[`read${singular}`] = (token, inputId, modifyRequest) => {
      return dispatch => {
        const id = parseInt(inputId, 10)
        dispatch({ type: singleReadAction, id })

        const requestSpec = this.this.apiSpec.fetch(token, pathname, id)
        if (typeof modifyRequest === 'function') modifyRequest(requestSpec)

        return requestSpec.then(item => {
          dispatch({ type: singleReadSuccessAction, [singularLower]: item })
          return item
        }).catch(error => {
          dispatch({ type: singleReadFailureAction, error })
          return error
        })
      }
    }

    actions[`update${singular}`] = (token, item, modifyRequest) => {
      return dispatch => {
        dispatch({ type: singleUpdateAction, [singularLower]: item })

        const requestSpec = this.apiSpec.update(token, pathname, item)
        if (typeof modifyRequest === 'function') modifyRequest(requestSpec)

        return requestSpec.then(() => {
          dispatch({ type: singleUpdateSuccessAction, [singularLower]: item })
          return item
        }).catch(error => {
          dispatch({ type: singleUpdateFailureAction, error })
          return error
        })
      }
    }

    actions[`delete${singular}`] = (token, item, modifyRequest) => {
      return dispatch => {
        dispatch({ type: singleDeleteAction, [singularLower]: item })

        const requestSpec = this.apiSpec.delete(token, pathname, item)
        if (typeof modifyRequest === 'function') modifyRequest(requestSpec)

        return requestSpec.then(() => {
            dispatch({ type: singleDeleteSuccessAction, [singularLower]: item })
            return true
          }).catch(error => {
            dispatch({ type: singleDeleteFailureAction, error })
            return error
          })
      }
    }

    return actions
  }

  createReducer = (singular, plural) => {
    const pluralLower = plural.toLowerCase()
    const singularLower = singular.toLowerCase()

    const DEFAULT_STATE = {}
    DEFAULT_STATE[pluralLower] = []
    DEFAULT_STATE[`${pluralLower}ById`] = {}

    DEFAULT_STATE[`reading${plural}`] = false
    DEFAULT_STATE[`reading${plural}Error`] = false

    DEFAULT_STATE[`creating${singular}`] = false
    DEFAULT_STATE[`creating${singular}Error`] = false

    DEFAULT_STATE[`reading${singular}`] = false
    DEFAULT_STATE[`reading${singular}Error`] = false

    DEFAULT_STATE[`updating${singular}`] = false
    DEFAULT_STATE[`updating${singular}Error`] = false

    DEFAULT_STATE[`deleting${singular}`] = false
    DEFAULT_STATE[`deleting${singular}Error`] = false

    return (state = DEFAULT_STATE, action) => {
      let newState = {}

      switch (action.type) {

      case ((`read_${plural}`).toUpperCase()):
        newState[`reading${plural}`] = true
        return { ...state, ...newState }

      case ((`${plural}_read`).toUpperCase()):
        newState[`reading${plural}`] = false
        newState[`${pluralLower}ById`] = { ...state[`${pluralLower}ById`] }
        action[pluralLower].forEach(item => {
          newState[`${pluralLower}ById`][item.id] = item
        })
        newState[pluralLower] = Object.values(newState[`${pluralLower}ById`])
        return { ...state, ...newState }

      case ((`${plural}_read_fail`).toUpperCase()):
        newState[`reading${plural}`] = false
        newState[`reading${plural}Error`] = action.error
        return { ...state, ...newState }

      case ((`create_${singular}`).toUpperCase()):
        newState[`creating${singular}`] = action[singular]
        return { ...state, ...newState }

      case ((`${singular}_create`).toUpperCase()):
        newState[`creating${singular}`] = false
        newState[`${pluralLower}ById`] = { ...state[`${pluralLower}ById`] }
        newState[`${pluralLower}ById`][action[singularLower].id] = action[singularLower]
        newState[pluralLower] = Object.values(newState[`${pluralLower}ById`])
        return { ...state, ...newState }

      case ((`${singular}_create_fail`).toUpperCase()):
        newState[`creating${plural}`] = false
        newState[`creating${plural}Error`] = action.error
        return { ...state, ...newState }

      case ((`read_${singular}`).toUpperCase()):
        newState[`reading${singular}`] = action.id
        return { ...state, ...newState }

      case ((`${singular}_read`).toUpperCase()):
        newState[`reading${singular}`] = false
        newState[`${pluralLower}ById`] = { ...state[`${pluralLower}ById`] }
        newState[`${pluralLower}ById`][action[singularLower].id] = action[singularLower]
        newState[pluralLower] = Object.values(newState[`${pluralLower}ById`])
        return { ...state, ...newState }

      case ((`${singular}_read_fail`).toUpperCase()):
        newState[`reading${singular}`] = false
        newState[`reading${singular}Error`] = action.error
        return { ...state, ...newState }

      case ((`update_${singular}`).toUpperCase()):
        newState[`updating${singular}`] = action[singularLower]
        return { ...state, ...newState }

      case ((`${singular}_update`).toUpperCase()):
        var newItem = action[singularLower]
        var oldItem = state[`${pluralLower}ById`][newItem.id]
        newState[`updating${singular}`] = false
        newState[`${pluralLower}ById`] = { ...state[`${pluralLower}ById`] }
        newState[`${pluralLower}ById`][action[singularLower].id] = { ...oldItem, ...newItem }
        newState[pluralLower] = Object.values(newState[`${pluralLower}ById`])
        return { ...state, ...newState }

      case ((`${singular}_update_fail`).toUpperCase()):
        newState[`updating${singular}`] = false
        newState[`updating${singular}Error`] = action.error
        return { ...state, ...newState }

      case ((`delete_${singular}`).toUpperCase()):
        newState[`deleting${singular}`] = action[singularLower]
        return { ...state, ...newState }

      case ((`${singular}_delete`).toUpperCase()):
        newState[`deleting${singular}`] = false
        newState[`${pluralLower}ById`] = { ...state[`${pluralLower}ById`] }
        delete newState[`${pluralLower}ById`][action[singularLower].id]
        newState[pluralLower] = Object.values(newState[`${pluralLower}ById`])
        return { ...state, ...newState }

      case ((`${singular}_delete_fail`).toUpperCase()):
        newState[`deleting${singular}`] = false
        newState[`deleting${singular}Error`] = action.error
        return { ...state, ...newState }

      default:
        return state

      }
    }
  }

}

