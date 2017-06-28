import { run } from '@cycle/run'
import { makeDOMDriver, div, input, p } from '@cycle/dom'
import xs from 'xstream'

const main = (sources) => {
  const vtree$ = sources.DOM.select('input').events('change')
    .map(evt => evt.target.checked)
    .startWith(false)
    .map(value => (
      div([
        input({ attrs: { type: 'checkbox' } }),
        'Toggle me',
        p(value ? 'ON' : 'OFF'),
      ])
    ))
  const sinks = {
    DOM: vtree$
  }
  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app')
}

run(main, drivers)
