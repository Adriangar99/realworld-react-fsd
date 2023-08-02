import {
  createEvent,
  createStore,
  Store,
  createApi,
  combine,
  sample,
} from 'effector';
import { Query } from './types';

export type QueryInit = {
  filter?: Filter;
  pagination?: Pagination | void;
};

export function createQueryModel() {
  const init = createEvent<QueryInit>();
  const reset = createEvent();

  const $$filter = createFilterQueryModel();
  const $$pagination = createPaginationModel();

  const $query = combine(
    $$pagination.$query,
    $$filter.$query,
    (pageQuery, filterQuery) => ({
      query: { ...pageQuery, ...filterQuery },
    }),
  );

  sample({
    clock: init,
    fn: ({ filter }) => filter,
    target: $$filter.init,
  });

  sample({
    clock: init,
    fn: ({ pagination }) => pagination,
    target: $$pagination.init,
  });

  sample({
    clock: $$filter.filterChanged,
    target: [$$pagination.reset],
  });

  return {
    init,
    reset,
    $query,
    $$filter,
    $$pagination,
  };
}

type PaginationQuery = Required<Pick<Query, 'limit' | 'offset'>>;

type Pagination = {
  page?: number;
  pageSize?: number;
  step?: number;
};
type Pagination1 = Required<Pagination>;

function createPaginationModel() {
  const init = createEvent<Pagination | void>();
  const reset = createEvent();
  const nextPage = createEvent();
  const pageChanged = createEvent();

  const $config = createStore<Pagination1>({
    page: 1,
    pageSize: 10,
    step: 1,
  })
    .on(init, (defaultConfig, newConfig) => ({
      ...defaultConfig,
      ...newConfig,
    }))
    .on(nextPage, (config) => ({
      ...config,
      page: config.page + config.step,
    }))
    .reset(reset);

  const $query: Store<PaginationQuery> = $config.map(({ page, pageSize }) => ({
    offset: (page - 1) * pageSize,
    limit: pageSize,
  }));

  sample({
    clock: nextPage,
    target: pageChanged,
  });

  return { init, reset, nextPage, pageChanged, $query };
}

type FilterQuery = Pick<Query, 'author' | 'favorited' | 'tag'>;

type Filter = {
  filter: keyof FilterQuery;
  value: string;
};

function createFilterQueryModel() {
  const init = createEvent<Filter | void>();
  const reset = createEvent();

  const filterChanged = createEvent();

  const $query = createStore<FilterQuery | null>(null)
    .on(init, (defaultQuery, newQuery) =>
      newQuery ? { [newQuery.filter]: newQuery.value } : defaultQuery,
    )
    .reset(reset);

  const filterBy = createApi($query, {
    all: () => null,
    tag: (_, tag: string) => ({ tag }),
    author: (_, author: string) => ({ author }),
    authorFavorites: (_, favorited: string) => ({ favorited }),
  });

  const filterEvents = Object.values(filterBy);

  sample({
    clock: filterEvents,
    target: filterChanged,
  });

  return { init, reset, filterBy, filterChanged, $query };
}
