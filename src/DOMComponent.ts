import { ReactElement, InternalComponent } from './FakeReact'

class DOMComponent {
  currentElement: ReactElement
  renderedChildren?: InternalComponent[]
  node?: HTMLElement

  constructor(element: ReactElement) {
    this.currentElement = element
  }

  mount(): HTMLElement | null {
    return document.getElementById('123')
  }
}

export {
  DOMComponent
}