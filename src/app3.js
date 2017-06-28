import { run } from '@cycle/run';
import { makeDOMDriver, button, p, div } from '@cycle/dom';
import xs from 'xstream';

const main = (sources) => {
    const action$ = xs.merge(
        sources.DOM.select('.des').events('click').mapTo(-1),
        sources.DOM.select('.inc').events('click').mapTo(1)
    );
    const count$ = action$.fold((x, y) => x + y, 0);

    const vdom$ = count$.map(count => (
        div([
            button('.des', '减少'),
            button('.inc', '增加'),
            p(`值：${count}`)
        ])
    ))

    const sinks = {
        DOM: vdom$,
    };
    return sinks;
}

const drivers = {
    DOM: makeDOMDriver('#app'),
}

run(main, drivers);
