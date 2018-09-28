/* @flow */
import * as events from './events';

test('events.log to use "track" for standard events', () => {
  window.fbq = jest.fn();
  events.log('ViewContent', {
    a: 1
  });
  expect(window.fbq).toBeCalledWith('track', 'ViewContent', {
    a: 1
  });
});

test('events.log to use "trackCustom" for non standard events', () => {
  window.fbq = jest.fn();
  events.log('MyEvent', {
    a: 1
  });
  expect(window.fbq).toBeCalledWith('trackCustom', 'MyEvent', {
    a: 1
  });
});
