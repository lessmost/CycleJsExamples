import { run } from '@cycle/run';
import { makeDOMDriver, div, input, span, h2, button } from '@cycle/dom';
import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine'

function main(sources) {
    const click$ = sources.DOM.select('.add-btn').events('click');
    const input$ = sources.DOM.select('.input').events('change').map(evt => evt.target.value);
    const check$ = sources.DOM.select('.checkbox').events('change').map(evt => ({ checked: evt.target.checked, idx: evt.target.dataset.idx }));

    const items$ = click$.compose(sampleCombine(input$))
        .map(([evt, value]) => value)
        .fold((arr, item) => arr.concat(item), [])
        .startWith([]);

    const checkedItems$ = check$
        .fold((arr, item) => {
            const idx = arr.findIndex(elem => elem.idx === item.idx);
            if (idx >= 0) {
                arr.splice(idx, 1, item);
            } else {
                arr.push(item);
            }
            return arr;
        }, [])
        .startWith([]);

    const citems$ = xs.combine(items$, checkedItems$)
        .map(([items, checkedItems]) => {
            return items.map((item, idx) => {
                const check = checkedItems.find(elem => elem.idx == idx);
                if (check) {
                    return {
                        name: item,
                        checked: check.checked,
                    };
                } else {
                    return {
                        name: item,
                        checked: false,
                    };
                }
            });
        });

    const vtree$ = citems$.map(items => (
        div('.todo', [
            div('.header', [
                input('.input'),
                button('.add-btn', 'ADD'),
            ]),
            div('.items', items.map((item, idx) => (
                div('.item', [
                    input('.checkbox', { attrs: { type: 'checkbox', 'data-idx': idx, checked: item.checked } }),
                    span('.text', { style: { textDecoration: (item.checked ? 'line-through' : 'initial') } }, item.name),
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
