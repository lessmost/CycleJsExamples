import { run } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import { makeDOMDriver, h2 } from '@cycle/dom';
import xs from 'xstream';

const main = (sources) => {
    const msg$ = xs.periodic(1000).map(counter => `counter ${counter}`);
    const timer$ = sources.timer;
    const vtree$ = timer$.map(counter => h2(`${counter}`));

    const sinks = {
        log: msg$,
        DOM: vtree$,
    };
    return sinks;
};

// WRITE-ONLY DRIVER
const makeLogDriver = () => {
    return msg$ => msg$.addListener({
        next: msg => console.log(msg),
    });
}

// READ-ONLY DRIVER
const makeTimerDriver = (interval) => {
    let counter = 0;
    return () => {
        const source = xs.create({
            start: listener => {
                setInterval(() => {
                    listener.next(counter);
                    counter++;
                }, interval);
            },
            stop: () => { },
        });

        return adapt(source);
    };
}

const drivers = {
    log: makeLogDriver(),
    timer: makeTimerDriver(1000),
    DOM: makeDOMDriver('#app'),
}
run(main, drivers);
