import { run } from '@cycle/run';
import { makeDOMDriver, div, input, h2 } from '@cycle/dom';
import xs from 'xstream';

// MODEL
const model = (actions) => {
    const weight$ = actions.changeWeight$.startWith(70);
    const height$ = actions.changeHeight$.startWith(170);

    const state$ = xs.combine(weight$, height$).map(([weight, height]) => {
        const heightMeter = height * 0.01;
        const bmi = Math.round(weight / (heightMeter * heightMeter));
        return {
            weight,
            height,
            bmi,
        }
    });

    return state$;
}


// VIEW
const view = (state$) => {
    return state$.map(({ weight, height, bmi }) => (
        div([
            weightRender(weight),
            heightRender(height),
            bmiRender(bmi),
        ])
    ));
};

const weightRender = (weight) => (
    div([
        `体重: ${weight}`,
        input('.weight', { attrs: { type: 'range', min: 40, max: 140, value: weight } }),
    ])
);

const heightRender = (height) => (
    div([
        `身高：${height}`,
        input('.height', { attrs: { type: 'range', min: 140, max: 210, value: height } }),
    ])
);

const bmiRender = (bmi) => (
    h2(`BMI：${bmi}`)
);

// INTENT
const intent = (DOM) => {
    return {
        changeWeight$: DOM.select('.weight').events('input').map(ev => ev.target.value),
        changeHeight$: DOM.select('.height').events('input').map(ev => ev.target.value),
    }
};

const drivers = {
    DOM: makeDOMDriver('#app'),
};

const main = (sources) => {
    return {
        DOM: view(model(intent(sources.DOM))),
    };
}

run(main, drivers);
