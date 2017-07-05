import { run } from '@cycle/run';
import { makeDOMDriver, div, input, span, h2, button } from '@cycle/dom';
import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine'

function main(sources) {
    const click$ = sources.DOM.select('.add-btn').events('click');
    const input$ = sources.DOM.select('.input').events('change').map(evt => evt.target.value);

    const items$ = click$.compose(sampleCombine(input$))
        .map(([evt, value]) => value)
        .fold((arr, item) => arr.concat([item]), [])
        .remember();

    const vtree$ = items$.map(items => (
        div('.todo',[
            div('.header', [
                input('.input'),
                button('.add-btn', 'ADD'),
            ]),
            div('.items', items.map(item => (
                div('.item', [
                    input({attrs: { type: 'checkbox'}}),
                    span('.text', item),
                ])
            ))),
        ])
    ));

    const sinks = {
        DOM: vtree$
    }
    return sinks
}

const drivers = {
    DOM: makeDOMDriver('#app'),
};
run(main, drivers);
