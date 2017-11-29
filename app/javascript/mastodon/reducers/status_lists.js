import {
  FAVOURITED_STATUSES_FETCH_SUCCESS,
  FAVOURITED_STATUSES_EXPAND_SUCCESS,
} from '../actions/favourites';
import {
  PINNED_STATUSES_FETCH_SUCCESS,
} from '../actions/pin_statuses';
import {
  SCHEDULED_STATUSES_FETCH_SUCCESS,
  SCHEDULED_STATUSES_EXPAND_SUCCESS,
  SCHEDULED_STATUSES_ADDITION,
} from '../../pawoo_music/actions/schedules';
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import {
  FAVOURITE_SUCCESS,
  UNFAVOURITE_SUCCESS,
  PIN_SUCCESS,
  UNPIN_SUCCESS,
} from '../actions/interactions';

const initialState = ImmutableMap({
  favourites: ImmutableMap({
    next: null,
    loaded: false,
    items: ImmutableList(),
  }),
  pins: ImmutableMap({
    next: null,
    loaded: false,
    items: ImmutableList(),
  }),
  schedules: ImmutableMap({
    next: null,
    loaded: false,
    items: ImmutableList(),
  }),
  'favourites:music': ImmutableMap({
    next: null,
    loaded: false,
    items: ImmutableList(),
  }),
  schedules: ImmutableMap({
    next: null,
    loaded: false,
    items: ImmutableList(),
  }),
});

const insertToDateSortedList = (state, listType, statuses, allStatuses) => {
  return state.update(listType, listMap => listMap.withMutations(map => {
    const compare = (i, j) => {
      if (i.created_at < j.created_at) {
        return -1;
      } else if (i.created_at > j.created_at) {
        return 1;
      } else {
        return 0;
      }
    };

    map.set('items', map.get('items')
                        .map(id => ({ id, created_at: allStatuses.getIn([id, 'created_at']) }))
                        .concat(statuses)
                        .sort(compare)
                        .map(item => item.id));
  }));
};

const normalizeList = (state, listType, statuses, next) => {
  return state.update(listType, listMap => listMap.withMutations(map => {
    map.set('next', next);
    map.set('loaded', true);
    map.set('items', ImmutableList(statuses.map(item => item.id)));
  }));
};

const appendToList = (state, listType, statuses, next) => {
  return state.update(listType, listMap => listMap.withMutations(map => {
    map.set('next', next);
    map.set('items', map.get('items').concat(statuses.map(item => item.id)));
  }));
};

const prependOneToList = (state, listType, status) => {
  return state.update(listType, listMap => listMap.withMutations(map => {
    map.set('items', map.get('items').unshift(status.get('id')));
  }));
};

const removeOneFromList = (state, listType, status) => {
  return state.update(listType, listMap => listMap.withMutations(map => {
    map.set('items', map.get('items').filter(item => item !== status.get('id')));
  }));
};

export default function statusLists(state = initialState, action) {
  switch(action.type) {
  case FAVOURITED_STATUSES_FETCH_SUCCESS:
    return normalizeList(state, (action.onlyMusics ? 'favourites:music' : 'favourites'), action.statuses, action.next);
  case FAVOURITED_STATUSES_EXPAND_SUCCESS:
    return appendToList(state, (action.onlyMusics ? 'favourites:music' : 'favourites'), action.statuses, action.next);
  case SCHEDULED_STATUSES_FETCH_SUCCESS:
    return normalizeList(state, 'schedules', action.statuses, action.next);
  case SCHEDULED_STATUSES_EXPAND_SUCCESS:
    return appendToList(state, 'schedules', action.statuses, action.next);
  case SCHEDULED_STATUSES_ADDITION:
    return insertToDateSortedList(state, 'schedules', action.statuses, action.allStatuses);
  case FAVOURITE_SUCCESS:
    return prependOneToList(state, (action.onlyMusics ? 'favourites:music' : 'favourites'), action.status);
  case UNFAVOURITE_SUCCESS:
    return removeOneFromList(state, (action.onlyMusics ? 'favourites:music' : 'favourites'), action.status);
  case PINNED_STATUSES_FETCH_SUCCESS:
    return normalizeList(state, (action.onlyMusics ? 'pins:music' : 'pins'), action.statuses, action.next);
  case PIN_SUCCESS:
    return prependOneToList(state, (action.onlyMusics ? 'pins:music' : 'pins'), action.status);
  case UNPIN_SUCCESS:
    return removeOneFromList(state, (action.onlyMusics ? 'pins:music' : 'pins'), action.status);
  default:
    return state;
  }
};
