class Main {
  name: string

  constructor(name: string) {
    this.name = name
  }

  show(text: string) {
    console.log(text)
  }
}

const main = new Main("Just Test")
main.show(main.name)