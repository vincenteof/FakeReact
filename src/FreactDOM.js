import { instantiate } from './internal'

/**
 * @param {Object} element - the react element, which is the vdom structure
 * @param {Object} container - the outer container, which is a real dom node
 * @returns {Component | Node} - return the public intance of the root component
 */
function render(element, container) {
    if (container.firstChild) {
        const prevNode = container.firstChild
        const prevRootComponent = prevNode._internalInstance
        const prevElement = prevNode.currentElement

        if (prevElement.type === element.type) {
            prevRootComponent.recieve(element)
            return
        } 
        unmountComponentAtNode(container)
    }

    const rootComponent = instantiate(element)  // the internal component implementation instance
    const node = rootComponent.mount()
    container.appendChild(node)

    // expose the root internal component instance
    node._internalInstance = rootComponent

    // return the public intance it provides(an instance of Freact.Component or a dom node)
    return rootComponent.getPublicInstance()
}

/**
 * @param {Node} containerNode - the node where the component mounted 
 */
function unmountComponentAtNode(containerNode) {
    const node = containerNode.firstChild
    const rootComponent = node._internalInstance
    rootComponent.unmount()
    containerNode.innerHTML = ''
}


export {
    render,
    unmountComponentAtNode
}