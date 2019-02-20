import { moveNodeAfter } from '../util'

function getExampleNodes() {
  const parent = document.createElement('div')
  const node1 = document.createElement('span')
  const node2 = document.createElement('span')
  const node3 = document.createElement('span')
  parent.appendChild(node1)
  parent.appendChild(node2)
  parent.appendChild(node3)
  return [parent, node1, node2, node3]
}

describe('move some node', () => {
  it('move to last I', () => {
    const [parent, node1, node2, node3] = getExampleNodes()
    moveNodeAfter(parent, node1, node3, 0)
    let child = parent.firstChild
    expect(child).toBe(node2)
    child = child.nextSibling
    expect(child).toBe(node3)
    child = child.nextSibling
    expect(child).toBe(node1)
  })

  it('move to last II', () => {
    const [parent, node1, node2, node3] = getExampleNodes()
    moveNodeAfter(parent, node1, node2, 1)
    let child = parent.firstChild
    expect(child).toBe(node2)
    child = child.nextSibling
    expect(child).toBe(node3)
    child = child.nextSibling
    expect(child).toBe(node1)
  })

  it('move to second counting from last', () => {
    const [parent, node1, node2, node3] = getExampleNodes()
    moveNodeAfter(parent, node1, node2, 0)
    let child = parent.firstChild
    expect(child).toBe(node2)
    child = child.nextSibling
    expect(child).toBe(node1)
    child = child.nextSibling
    expect(child).toBe(node3)
  })
})
