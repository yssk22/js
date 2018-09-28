/* @flow */
import { events, object } from '@yssk22/mizuki';
import { type APIError } from './APIError';
import { ResourceSettings } from './ResourceSettings';

const ComponentName = '@yssk22/utakata/rest/Store';

export type ResourceStatus =
  | 'draft' // a resource drafted on the client side, but not sent to the server.
  | 'creating' // a resource being requested for creating to the server
  | 'edit' // a resource being updated on the client side, but not sent to the server
  | 'updating' // a resource being requested for updating to the server
  | 'reading' // a resource being requested for reading to the server
  | 'deleting' // a reosurce being requested for deleting to the server
  | 'none'; // default, synched with the server.
export const ResourceStatusValues = {
  NONE: ('none': ResourceStatus),
  DRAFT: ('draft': ResourceStatus),
  CREATING: ('creating': ResourceStatus),
  EDIT: ('edit': ResourceStatus),
  UPDATING: ('updating': ResourceStatus),
  READING: ('reading': ResourceStatus),
  DELETING: ('deleting': ResourceStatus)
};

export type ResourceState<T> = {
  status: ResourceStatus,
  previous: ?ResourceState<T>,
  error: ?string,
  fieldErrors: ?{ [string]: string }
};

export type ResourceWithState<T> = T & {
  __state: ResourceState<T>
};

export type RestResourceStoreCollection = {
  [string]: ResourceStore<any>
};

export type ResourceStoreDataMap = {
  [string]: number
};

export type ResourceStore<T> = {
  data: Array<ResourceWithState<T>>,
  dataIndex: ResourceStoreDataMap,
  drafts: Array<ResourceWithState<T>>,
  draftIndex: ResourceStoreDataMap,
  status: 'reading' | 'none',
  error: ?string
};

export type UpdateArgs = {
  id: string,
  fields: {
    [string]: {
      type?: 'update' | 'delete',
      value: any
    }
  }
};

export type ResourceErrors = Array<{ id: string, error: APIError }>;

// Store Utility
export function genInitialState<T>() {
  return {
    data: ([]: Array<ResourceWithState<T>>),
    dataIndex: ({}: ResourceStoreDataMap),
    drafts: ([]: Array<ResourceWithState<T>>),
    draftIndex: ({}: ResourceStoreDataMap),
    status: 'none',
    error: null
  };
}

// generate a index map {} from the given list of resources.
export function genIndex<T>(data: Array<ResourceWithState<T>>, settings: ResourceSettings<T>) {
  return data.reduce((idxMap, v, i) => {
    idxMap[settings.getId(v)] = i;
    return idxMap;
  }, {});
}

// find a resource in Array.
export function findResource<T>(
  data: Array<ResourceWithState<T>>,
  dataIndex: { [string]: number },
  id: string
): ?{
  index: number,
  resource: ResourceWithState<T>
} {
  const idx = dataIndex[id];
  if (idx === undefined) {
    return undefined;
  }
  const target = data[idx];
  if (target === undefined) {
    delete dataIndex[id];
    return undefined;
  }
  return {
    index: idx,
    resource: target
  };
}

// update `data` using UpdateArgs
export function updateStore<T>(
  updates: Array<UpdateArgs>,
  data: Array<ResourceWithState<T>>,
  dataIndex: { [string]: number }
) {
  updates.forEach(u => {
    const found = findResource(data, dataIndex, u.id);
    if (!found) {
      events.error(ComponentName, `cannot find "${u.id}"`, {
        id: u.id
      });
    } else {
      if (!found.resource.__state) {
        events.fatal(ComponentName, `null resource state for ${found.resource.toString()}`);
      }
      switch (found.resource.__state.status) {
      case ResourceStatusValues.NONE:
        found.resource.__state.previous = object.deepCopy(found.resource);
        found.resource.__state.status = ResourceStatusValues.EDIT;
        break;
      case ResourceStatusValues.EDIT:
        break;
      case ResourceStatusValues.DRAFT:
        break;
      default:
        events.error(
          ComponentName,
          `invalid resource state '${
            found.resource.__state.status
          }' for ${found.resource.toString()}`
        );
      }
      updateResource(found.resource, u);
    }
  });
}

// update resource fields by UpdateArgs
export function updateResource<T>(
  resource: ResourceWithState<T>,
  update: UpdateArgs
): ResourceWithState<T> {
  Object.keys(update.fields).forEach(key => {
    const uu = update.fields[key];
    switch (uu.type) {
    case 'delete':
      delete resource[key];
      break;
    default:
      resource[key] = uu.value;
      break;
    }
  });
  return resource;
}

// delete resources by a list of ids.
export function deleteResources<T>(
  data: Array<ResourceWithState<T>>,
  dataIndex: { [string]: number },
  deletes: Array<string>
): Array<string> {
  const deleted: Array<string> = [];
  deletes.forEach(id => {
    const found = findResource(data, dataIndex, id);
    if (found) {
      data.splice(found.index, 1);
      deleted.push(id);
    }
  });
  return deleted;
}

// rebuild index in data.
export function rebuildIndexes<T>(
  data: Array<ResourceWithState<T>>,
  settings: ResourceSettings<T>
) {
  return data.reduce((idxMap, v, i) => {
    idxMap[settings.getId(v)] = i;
    return idxMap;
  }, {});
}

export function updateByServer<T>(
  store: ResourceStore<T>,
  resources: Array<T>,
  settings: ResourceSettings<T>
): Array<T> {
  const strategy = settings.getCollectionSortStrategy();
  const updates = resources.map(res => {
    const id = settings.getId(res);
    const found = findResource(store.data, store.dataIndex, id);
    const resource = (Object.assign({}, res, {
      __state: ({
        status: ResourceStatusValues.NONE,
        previous: null,
        error: null,
        fieldErrors: {}
      }: ResourceState<T>)
    }): ResourceWithState<T>);
    if (found) {
      // TODO: need some strategies "replace", "merge", ...etc if the server doesn't return a full set of resources.
      store.data[found.index] = resource;
    } else {
      switch (strategy) {
      case 'push':
        const idx = store.data.push(resource) - 1;
        store.dataIndex[id] = idx;
        break;
      case 'unshift':
        store.data.unshift(resource);
        break;
      default:
        store.data.push(resource);
        break;
      }
    }
    return resource;
  });
  let needRebuildIndex = strategy !== 'push';
  // sort index
  if (typeof strategy === 'function') {
    store.data.sort(strategy);
  }
  // limit the size
  const maxSize = settings.getCollectionMaxSize();
  if (maxSize > 0 && store.data.length > maxSize) {
    store.data.splice(maxSize);
    needRebuildIndex = true;
  }
  // rebuild index
  if (needRebuildIndex) {
    store.dataIndex = rebuildIndexes(store.data, settings);
  }
  return updates;
}

export function validateStore<T>(store: ?ResourceStore<T>) {
  if (!store) {
    throw new Error(`store is empty`);
  }
  _validateStore(store.drafts, store.draftIndex, (key: string, val: ResourceWithState<T>) => {
    switch (val.__state.status) {
    case ResourceStatusValues.DRAFT:
    case ResourceStatusValues.CREATING:
      break;
    default:
      throw new Error(`key "${key}" is in invalid status "${val.__state.status}"`);
    }
    if (val.__state.previous !== null) {
      throw new Error(`draft key "${key}" should not have the previous object`);
    }
  });
  _validateStore(store.data, store.dataIndex, (key: string, val: ResourceWithState<T>) => {
    switch (val.__state.status) {
    case ResourceStatusValues.DRAFT:
    case ResourceStatusValues.CREATING:
      throw new Error(`key "${key}" is in invalid status "${val.__state.status}"`);
    default:
    }
  });
}

function _validateStore<T>(
  data: Array<ResourceWithState<T>>,
  dataIndex: ResourceStoreDataMap,
  f: (string, ResourceWithState<T>) => void
) {
  Object.keys(dataIndex).forEach(key => {
    let idx = dataIndex[key];
    let val = data[idx];
    if (val === undefined) {
      throw new Error(`key "${key}" is orphaned`);
    }
    if (!object.canDeepCopy(val)) {
      throw new Error(`key "${key}" contains non-JSON serialiable objects`);
    }
    if (val.__state === undefined) {
      throw new Error(`key "${key}" doesn't have a __state field`);
    }
    f(key, val);
  });
}
