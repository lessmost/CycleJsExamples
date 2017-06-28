import { run } from '@cycle/run'
import { makeDOMDriver, div, button, h1, h4, a } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http';

const main = (sources) => {
  const getRandomUser$ = sources.DOM.select('.btn').events('click')
    .map(() => {
      const num = Math.floor(Math.random() * 9) + 1;
      return {
        url: `https://jsonplaceholder.typicode.com/users/${num}`,
        category: 'users',
        method: 'GET',
      };
    });

  const user$ = sources.HTTP.select('users')
    .flatten()
    .map(res => res.body)
    .startWith(null);

  const vdom$ = user$.map(user => (
    div('.users', [
      button('.btn', 'Get Random User'),
      user ? (
        div('.user-detail', [
          h1('.user-name', user.name),
          h4('.user-email', user.email),
          a('.user-website', { attrs: { href: user.website } }, user.website),
        ])
      ) : null,
    ])
  ));

  const sinks = {
    DOM: vdom$,
    HTTP: getRandomUser$,
  };

  return sinks;
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
}

run(main, drivers)
