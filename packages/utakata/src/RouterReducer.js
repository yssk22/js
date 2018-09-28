const REACT_NATIVE_ROUTER_FLUX_FOCUS = 'REACT_NATIVE_ROUTER_FLUX_FOCUS';
const REACT_ROUTER_LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

const initialState = {
  scene: {}
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case REACT_NATIVE_ROUTER_FLUX_FOCUS:
    return {
      ...state,
      scene: action.scene
    };
  case REACT_ROUTER_LOCATION_CHANGE:
    return {
      ...state,
      locationBeforeTransitions: action.payload
    };
  default:
    return state;
  }
}
