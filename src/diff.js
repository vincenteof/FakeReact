import { OperationTypes, SpecialElementTypes } from './constants'
import warning from 'warning'

/**
 * diff algorithm for child elements of virtual dom
 *
 * @param {Object[]} prevElements
 * @param {Object[]} nextElements
 * @returns {Object[]} - the patches for the old dom transforming to a new one and next components
 */
function diff(prevComponents, nextElements, instantiate) {
  let lastIndex = 0 // farest index in prevElements ever seen
  let nextIndex = 0 // iteration index in nextElements
  let flagIndex = 0 // iteration index mathing with `lastIndex`
  let lastNode = null
  const prevComponentMap = converToMap(prevComponents, true)
  const nextElemMap = converToMap(nextElements)
  const patches = []
  const repalceOrDelete = []
  const nextComponents = []

  for (; nextIndex < nextElements.length; nextIndex++) {
    const nextElem = nextElements[nextIndex]
    const nextKey = nextElem.props.key
    const prevComponent = prevComponentMap[nextKey]
    const prevElem = prevComponent.currentElement
    const idx = nextIndex - flagIndex >= 1 ? nextIndex - flagIndex - 1 : 0

    if (!prevComponent) {
      const nextComponent = instantiate(nextElem)
      nextComponent._mountedIndex = nextIndex
      nextComponents.push(nextComponent)
      patches.push({
        type: OperationTypes.INSERT,
        node: nextComponent.mount(),
        referenceNode: lastNode,
        idx
      })
      continue
    }

    let currentComponent = prevComponent
    // update prev component
    if (prevElem.type === nextElem.type) {
      prevComponent.receive(nextElem)
    } else if (prevElem.type === SpecialElementTypes.NULL) {
      const nextComponent = instantiate(nextElem)
      nextComponent._mountedIndex = nextIndex
      nextComponents.push(nextComponent)
      patches.push({
        type: OperationTypes.INSERT,
        node: nextComponent.mount(),
        referenceNode: lastNode,
        idx
      })
      continue
    } else if (nextElem.type === SpecialElementTypes.NULL) {
      const prevNode = prevComponent.getHostNode()
      prevComponent.unmount()
      repalceOrDelete.push({
        type: OperationTypes.REMOVE,
        node: prevNode
      })
    } else {
      const prevNode = prevComponent.getHostNode()
      prevComponent.unmount()
      currentComponent = instantiate(nextElem)
      repalceOrDelete.push({
        type: OperationTypes.REPLACE,
        prevNode,
        nextNode: currentComponent.mount()
      })
    }

    if (prevComponent._mountedIndex >= lastIndex) {
      lastIndex = prevComponent._mountedIndex
      flagIndex = nextIndex
      lastNode = prevComponent.getHostNode()
    } else {
      patches.push({
        type: OperationTypes.MOVE,
        node: prevComponent.getHostNode(),
        referenceNode: lastNode,
        idx
      })
    }

    currentComponent._mountedIndex = nextIndex
    nextComponents.push(currentComponent)
  }

  for (const prevKey of Object.keys(prevComponentMap)) {
    const prevComponent = prevComponentMap[prevKey]
    if (!nextElemMap[prevKey]) {
      patches.push({
        type: OperationTypes.REMOVE,
        node: prevComponent.getHostNode()
      })
    }
  }

  return [patches.concat(repalceOrDelete), nextComponents]
}

/**
 * convert elements array to a keyed map
 *
 * @param {Object[]} lst - elements or components
 */
function converToMap(lst, isComponent) {
  const result = {}
  lst.forEach(item => {
    const key = isComponent
      ? item.currentElement.props.key
      : item.props.key
    warning(key, 'freact element should contain a key')
    warning(!result[key], 'elements should not contain duplicate keys')
    result[key] = item
  })
  return result
}

export { diff }
