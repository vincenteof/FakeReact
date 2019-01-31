import { instantiate } from './internal'

/**
 * @param {Object} element - the react element, which is the vdom structure
 * @param {Object} container - the outer container, which is a real dom node
 * @returns {Component} - return the public intance of the root component
 */
function render(element, container) {
    const rootComponent = instantiate(element)
    const node = rootComponent.mount()
    container.appendChild(node)

    // return the public intance it provides
    return rootComponent.getPublicInstance()
}



export {
    render
}