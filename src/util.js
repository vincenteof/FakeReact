import invariant from 'invariant/browser'

// it checks whether a class is a subclass of freact component
function isClass(type) {
  // Freact.Component subclasses have this flag
  return (
    Boolean(type.prototype) && Boolean(type.prototype.isFreactComponent)
  )
}

// it checks whether a react child(element) is just text
function isText(child) {
  return typeof child === 'undefined'
}

// attach event listener to dom node
function attachListenerToNode(node, prop, listener) {
  const eventName = prop.startsWith('on')
    ? prop.substr(2, prop.length)
    : prop
  if (eventName && eventName.length !== 0) {
    node.addEventListener(eventName, listener)
  }
}

// remove event listener from dom node
function removeListenerFromNode(node, prop, listener) {
  const eventName = prop.startsWith('on')
    ? prop.substr(2, prop.length)
    : prop
  if (eventName && eventName.length !== 0) {
    node.removeEventListener(eventName, listener)
  }
}

// move node to some position after referenceNode
function moveNodeAfter(parent, node, referenceNode, pos) {
  if (!referenceNode) {
    parent.insertBefore(node, parent.firstChild)
  }

  let iterIndex = pos
  let sibling = referenceNode.nextSibling
  if (sibling === null) {
    invariant(
      referenceNode === parent.lastChild,
      'referenceNode should be the child'
    )
    invariant(pos === 0, 'position for last child can only be zero')
    parent.appendChild(node)
    return
  }

  while (iterIndex > 0) {
    if (sibling === null) {
      invariant(false, 'position should not exceed the total children')
    }
    sibling = sibling.nextSibling
    iterIndex -= 1
  }

  parent.insertBefore(node, sibling)
}

export {
  isClass,
  isText,
  attachListenerToNode,
  removeListenerFromNode,
  moveNodeAfter
}
