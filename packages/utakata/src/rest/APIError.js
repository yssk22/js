/* @flow */
import { events } from '@yssk22/mizuki';

const ComponentName = '@yssk22/utakata/redux/rest/APIError';

export const APIErrorCode = {
  NETWORK: 'network_error',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

export class APIError extends Error {
  code: string;

  constructor(err: { message: string, code: string }) {
    super(err.message);
    (this: any).constructor = APIError;
    (this: any).__proto__ = APIError.prototype;
    this.code = err.code;
  }
}

export class FieldErrors extends APIError {
  fields: { [string]: string };

  constructor(errors: { [string]: string }) {
    super({
      message: 'field errors',
      code: '400'
    });
    // WORKAROUND: https://github.com/babel/babel/issues/3083
    (this: any).constructor = FieldErrors;
    (this: any).__proto__ = FieldErrors.prototype;
    this.fields = errors;
  }
}

export const isHTTPError = (err: ?APIError): boolean => {
  if (err) {
    return typeof err.code == 'string' && err.code.startsWith('http_error_');
  }
  return false;
};

export const isTimeout = (err: ?APIError): boolean => {
  if (err && err.code) {
    return err.code == APIErrorCode.TIMEOUT;
  }
  return false;
};

export const isNetwork = (err: ?APIError): boolean => {
  if (err && err.code) {
    return err.code == APIErrorCode.NETWORK;
  }
  return false;
};

export const isUnexpected = (err: ?APIError): boolean => {
  if (err && err.code) {
    return err.code == APIErrorCode.UNKNOWN;
  }
  return false;
};

export const genUnexpectedError = (message: string): APIError => {
  return new APIError({ code: APIErrorCode.UNKNOWN, message: message });
};

export const genAPIError = (err: any, resp: any): ?APIError => {
  if (!err) {
    return null;
  }
  const apiError = _genAPIError(err, resp);
  if (resp && resp.req) {
    events.error(ComponentName, apiError.message, {
      method: resp.req.method,
      uri: resp.req.url,
      response: resp.body
    });
  } else {
    events.error(ComponentName, apiError.message);
  }
  return apiError;
};

const _genAPIError = (err: any, resp: any): APIError => {
  if (resp && resp.body) {
    if (resp.body.code && resp.body.message) {
      return new APIError(resp.body);
    }
    if (resp.body.errors && typeof (resp.body.errors === 'object')) {
      // { errors: {key: [{message: 'xxxx'}]} }
      const errors = Object.keys(resp.body.errors).reduce((hash, fieldKey) => {
        const fieldErrors = resp.body.errors[fieldKey];
        if (
          Array.isArray(fieldErrors) &&
          fieldErrors.length > 0 &&
          typeof fieldErrors[0].message === 'string'
        ) {
          hash[fieldKey] = fieldErrors[0].message;
        }
        return hash;
      }, {});
      if (Object.keys(errors).length > 0) {
        return new FieldErrors(errors);
      }
      events.error(ComponentName, 'API respond with errors field but seems not an FieldErrors', {
        response: resp.body
      });
    }
  }
  // server response doesn't show handled error
  if (err) {
    if (err.timeout) {
      return new APIError({
        code: APIErrorCode.TIMEOUT,
        message: `server didn't respond your request`
      });
    }
    if (err.status) {
      return new APIError({
        code: `http_error_${err.status}`,
        message: `server returns http status ${err.status}`
      });
    }
    return new APIError({
      code: APIErrorCode.UNKNOWN,
      message: err.message
    });
  }
  return new APIError({
    code: APIErrorCode.NETWORK,
    message: 'network error is detected while processing API'
  });
};
