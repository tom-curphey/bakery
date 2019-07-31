import React from 'react';
import App from './App';
import { shallow } from 'enzyme';

it('Expect to render App component', () => {
  expect(shallow(<App />)).toMatchSnapshot();
});
