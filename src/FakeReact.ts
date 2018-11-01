import { CompositeComponent } from './CompositeComponent'
import { DOMComponent } from './DOMComponent'

abstract class ReactComponent {
  props?: object
  abstract render(): ReactElement
  componentWillMount() {}
}

type FuncComponent = (props?: object) => ReactElement
type ClassComponent = new(props?: object) => ReactComponent

type ReactElementType = string | FuncComponent | ClassComponent

// instance of `ReactElement` is something like `{type: 'div', props: {}}`
type ReactElement = { type: ReactElementType, props?: any }

type InternalComponent = CompositeComponent | DOMComponent

function instantiateComponent(element: ReactElement) {
  const type = element.type
  if (typeof element === 'string') {
    return new DOMComponent(element)
  } else {
    return new CompositeComponent(element)
  }
}

function mountTree(element: ReactElement, containerNode: HTMLElement): ReactComponent | HTMLElement | undefined {
  const rootComponent = instantiateComponent(element)
  const node = rootComponent.mount()
  containerNode.appendChild(node)
  return rootComponent.getPublicInstance()
}

export {
  FuncComponent,
  ReactElementType,
  ReactComponent,
  ReactElement,
  ClassComponent,
  instantiateComponent,
  InternalComponent,
  mountTree
}