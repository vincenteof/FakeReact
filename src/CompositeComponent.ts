import { 
  ReactElement, 
  FuncComponent, 
  ClassComponent, 
  ReactComponent , 
  instantiateComponent, 
  InternalComponent 
} from './FakeReact'


class CompositeComponent {
  currentElement: ReactElement
  renderedComponent?: InternalComponent
  publicInstance?: ReactComponent
  
  constructor(element: ReactElement) {
    this.currentElement = element
  }

  getPublicInstance(): ReactComponent | undefined {
    return this.publicInstance
  }

  mount(): HTMLElement {
    const element = this.currentElement
    const type = element.type
    const props = element.props

    if (typeof type === 'string') {
      throw new Error('type of `CompositeComponent` should not be `string`')
    }

    let renderElement
    if (typeof type === 'function') {
      renderElement = (<FuncComponent>type)(props)
    } else {
      const publicInstance = new (<ClassComponent>type)(props)
      publicInstance.props = props
      publicInstance.componentWillMount()
      renderElement = publicInstance.render()
      this.publicInstance = publicInstance
    }

    const renderedComponent = instantiateComponent(renderElement)
    this.renderedComponent = renderedComponent
    
    return renderedComponent.mount()
  }
}

export {
  InternalComponent,
  CompositeComponent
}