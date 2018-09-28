/* @flow */
import { maybeDev } from './environment';

// https://developers.facebook.com/docs/ads-for-websites/pixel-events/
const FBStandardEvents = [
  'ViewContent',
  'Search',
  'AddToCart',
  'AddToWishlist',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'Lead',
  'CompleteRegistration'
];

export const log = (eventName: string, eventParams: any) => {
  if (window && window.fbq) {
    if (FBStandardEvents.indexOf(eventName) >= 0) {
      window.fbq('track', eventName, eventParams);
    } else {
      window.fbq('trackCustom', eventName, eventParams);
    }
  }
};

const ErrorEventName = 'AppError';
const FatalEventName = 'AppFatal';

const devFriendlyLog = (
  level: 'error' | 'fatal',
  component: string,
  message: string,
  params?: any
) => {
  if (maybeDev()) {
    console.log(`[${component}.${level}] ${message}`);
    if (params && typeof params === 'object') {
      const keys = Object.keys(params);
      keys.forEach((k, i) => {
        const val = (params: any)[k];
        console.log(`[${component}.fatal]   ${k}: ${JSON.stringify(val)}`);
      });
    }
  }
};

export const error = (component: string, message: string, params?: any) => {
  const e = new Error(message);
  devFriendlyLog('error', component, message, params);
  log(ErrorEventName, {
    component: component,
    message: message,
    stack: e.stack,
    params: JSON.stringify(params)
  });
};

export const fatal = (component: string, message: string, params?: any) => {
  const e = new Error(`[${component}] ${message}`);
  devFriendlyLog('fatal', component, message, params);
  log(FatalEventName, {
    component: component,
    message: message,
    stack: e.stack,
    params: JSON.stringify(params)
  });
  throw e;
};
