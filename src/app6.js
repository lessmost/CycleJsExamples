import { run } from '@cycle/run';
import { makeDOMDriver, div, input, span, h2 } from '@cycle/dom';
import xs from 'xstream';
import isolate from '@cycle/isolate';

// Component
function LabeledSlider(sources) {
    const props$ = sources.props;
    const domSource = sources.DOM;

    const newValue$ = domSource
        .select('.slider')
        .events('input')
        .map(evt => evt.target.value);

    const state$ = props$
        .map(prop => newValue$.map(value => ({
            label: prop.label,
            unit: prop.unit,
            min: prop.min,
            max: prop.max,
            value,
        })).startWith(prop)
        )
        .flatten()
        .remember();

    const vdom$ = state$.map(state =>
        div('.labeled-slider', [
            span('.label', `${state.label} ${state.value} ${state.unit}`),
            input('.slider', {
                attrs: { type: 'range', min: state.min, max: state.max, value: state.value }
            }),
        ])
    );

    const sinks = {
        DOM: vdom$,
        value: state$.map(state => state.value),
    };

    return sinks;
}

const drivers = {
    DOM: makeDOMDriver('#app'),
};

const main = (sources) => {
    const weightSlider = isolate(LabeledSlider, 'weight')({
        DOM: sources.DOM,
        props: xs.of({
            label: 'weight',
            unit: 'kg',
            min: 40,
            max: 140,
            value: 70,
        })
    });
    const heightSlider = isolate(LabeledSlider, 'height')({
        DOM: sources.DOM,
        props: xs.of({
            label: 'height',
            unit: 'cm',
            min: 140,
            max: 210,
            value: 170,
        })
    });

    const bmi$ = xs.combine(weightSlider.value, heightSlider.value)
        .map(([weight, height]) => {
            const heightMeter = height * 0.01;
            const bmi = Math.round(weight / (heightMeter * heightMeter));
            return bmi;
        })
        .remember();

    const vdom$ = xs.combine(bmi$, weightSlider.DOM, heightSlider.DOM)
        .map(([bmi, weightVDom, heightVDom]) => (
            div([
                weightVDom,
                heightVDom,
                h2(`BMI: ${bmi}`),
            ])
        ));

    return {
        DOM: vdom$,
    };
}

run(main, drivers);
