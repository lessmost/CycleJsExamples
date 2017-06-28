import { run } from '@cycle/run';
import { makeDOMDriver, div, input, h2 } from '@cycle/dom';
import xs from 'xstream';

const main = (sources) => {
    const changeWeight$ = sources.DOM.select('.weight').events('input').map(ev => ev.target.value);
    const changeHeight$ = sources.DOM.select('.height').events('input').map(ev => ev.target.value);

    const weight$ = changeWeight$.startWith(70);
    const height$ = changeHeight$.startWith(170);

    const bmi$ = xs.combine(weight$, height$).map(([weight, height]) => {
        const heightMeter = height * 0.01;
        const bmi =  Math.round(weight / (heightMeter * heightMeter));
        return {
            weight,
            height,
            bmi,
        }
    });

    const vdom$ = bmi$.map(({weight, height, bmi}) => (
        div([
            div([
                `体重: ${weight}`,
                input('.weight', { attrs: { type: 'range', min: 40, max: 140, value: weight } }),
            ]),
            div([
                `身高：${height}`,
                input('.height', { attrs: { type: 'range', min: 140, max: 210, value: height } }),
            ]),
            h2(`BMI：${bmi}`),
        ])
    ));

    return {
        DOM: vdom$,
    };
};

const drivers = {
    DOM: makeDOMDriver('#app'),
};

run(main, drivers);
