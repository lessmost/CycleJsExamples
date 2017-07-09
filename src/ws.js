import { run } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import { makeDOMDriver, div, ul, li, input, button } from '@cycle/dom';
import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine'

const main = (sources) => {
    const input$ = sources.DOM.select('.input').events('change').map(evt => evt.target.value);
    const click$ = sources.DOM.select('.btn').events('click');
    const msg$ = click$.compose(sampleCombine(input$))
        .map(([evt, value]) => value)
        .startWith('New peer added');

    const vtree$ = sources.WS.fold((items, item) => items.concat(item), [])
        .startWith([])
        .map(items => div([
            ul(items.map(item => li(item))),
            div([
                input('.input', { attr: { type: 'text' } }),
                button('.btn', 'Send'),
            ]),
        ]));

    const sinks = {
        DOM: vtree$,
        WS: msg$,
    };
    return sinks;
};


const makeWSDriver = (server) => {
    return (sink) => {
        const conn = new WebSocket(server);
        let buf = [];

        conn.onopen = () => {
            buf.forEach(msg => {
                conn.send(msg);
            });
            buf = [];
        };

        sink.addListener({
            next: msg => {
                if (conn.readyState === 0) {
                    buf.push(msg);
                } else if (conn.readyState === 1) {
                    conn.send(msg);
                }
            },
            error: () => { },
            complete: () => { },
        });

        const source = xs.create({
            start: listener => {
                conn.onerror = (err) => { listener.error(err); };
                conn.onmessage = (evt) => { listener.next(evt.data); };
            },
            stop: () => {
                conn.close();
            },
        });

        return adapt(source);
    };
}
const drivers = {
    DOM: makeDOMDriver('#app'),
    WS: makeWSDriver('ws://127.0.0.1:8080/'),
};
run(main, drivers);
