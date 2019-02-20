import warning from 'warning'

const MOVE = 'MOVE'
const INSERT = 'INSERT'
const REMOVE = 'REMOVE'

/**
 * diff algorithm for child elements of virtual dom
 * TODO: instaniate related logic, null and text related logic
 *
 * @param {Object[]} prevElements
 * @param {Object[]} nextElements
 * @returns {Object[]} - the patches for the old dom transforming to a new one
 */
function diff(parentNode, prevElements, prevComponents, nextElements) {
  let lastIndex = 0 // farest index in prevElements ever seen
  let nextIndex = 0 // iteration index in nextElements
  let flagIndex = 0 // iteration index mathing with `lastIndex`
  let lastNode = null
  const prevElemMap = converToMap(prevElements, prevComponents)
  const nextElemMap = converToMap(nextElements)
  const patches = []

  for (; nextIndex < nextElements.length; nextIndex++) {
    const nextElem = nextElements[nextIndex]
    const nextKey = nextElem.props.key
    const prevPair = prevElemMap[nextKey]

    if (!prevPair) {
      patches.push({
        type: INSERT,
        parentNode,
        node: null, // TODO
        referenceNode: lastNode
      })
      continue
    }

    const [prevElem, prevComponent] = prevElemMap[nextKey]
    if (prevElem._mountedIndex >= lastIndex) {
      lastIndex = prevElem._mountedIndex // TODO
      flagIndex = nextIndex
      lastNode = prevComponent.getHostNode()
    } else {
      patches.push({
        type: MOVE,
        parentNode,
        node: null, // TODO
        referenceNode: lastNode,
        idx: nextIndex - flagIndex - 1
      })
    }
  }

  for (const prevKey of Object.keys(prevElemMap)) {
    const pair = prevElemMap[prevKey]
    if (!nextElemMap[prevKey]) {
      patches.push({
        type: REMOVE,
        parentNode,
        node: pair[1].getHostNode()
      })
    }
  }

  return patches
}

/**
 * convert elements array to a keyed map
 *
 * @param {Object[]} elements
 */
function converToMap(elements, components) {
  const result = {}
  elements.forEach((elem, idx) => {
    const key = elem.props.key
    if (!key) {
      warning('freact element should contain a key')
    }
    if (result[key]) {
      warning('elements should not contain duplicate keys')
    }
    if (components) {
      result[key] = [elem, components[idx]]
    } else {
      result[key] = elem
    }
  })
  return result
}

export default diff
