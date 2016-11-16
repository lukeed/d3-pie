
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Chart from '../index'

const gen = n => {
  const data = []

  for (var i = 0; i < n; i++) {
    data.push({
      label: `Label ${i}`,
      value: Math.random() * (25 * (n - 1))
    })
  }

  return data
}

class App extends Component {
  componentDidMount() {
    this.a = new Chart({
      target: this.refs.a
    })

    this.b = new Chart({
      target: this.refs.b,
      thickness: 5,
      width: 200,
      height: 100
    })

    const total = 3000

    this.c = new Chart({
      target: this.refs.c,
      thickness: 3,
      ease: 'elastic',
      duration: 600,
      color: ['RGB(0, 177, 240)', 'rgb(243, 43, 101)']
    })

    this.a.render(gen(6))
    this.b.render(gen(3))
    this.c.render(gen(5))
  }

  componentDidUpdate() {
    this.changeData()
  }

  changeData = _ => {
    this.a.update(gen(4))
    this.b.update(gen(3))
    this.c.update(gen(6))
  }

  render() {
    return <div>
      <div id="actions">
        <button onClick={this.changeData}>Animate</button>
      </div>

      <section>
        <h3>Defaults</h3>
        <p>Chart default settings.</p>
        <svg ref="a" className="chart"></svg>
      </section>

      <section>
        <h3>Small</h3>
        <p>Chart with a smaller size.</p>
        <svg ref="b" className="chart"></svg>
      </section>

      <section>
        <h3>Kitchen Sink</h3>
        <p>Chart with most settings configured.</p>
        <svg ref="c" className="chart"></svg>
      </section>
    </div>
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
