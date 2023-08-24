import { attachOperation } from '@farfetched/core';
import { createEvent, restore, sample } from 'effector';
import { Article, NewArticle, articleApi } from '~entities/article';
import { $$sessionModel } from '~entities/session';

export type CreateArticleModel = ReturnType<typeof createModel>;

export function createModel() {
  const create = createEvent<NewArticle>();
  const mutated = createEvent<Article>();
  const failure = createEvent<unknown>();
  const success = createEvent<Article>();

  const createArticleMutation = attachOperation(
    articleApi.createArticleMutation,
  );

  const $newArticle = restore(create, null);

  sample({
    clock: create,
    source: $newArticle,
    filter: Boolean,
    fn: (newArticle) => ({ article: newArticle }),
    target: createArticleMutation.start,
  });

  sample({
    clock: createArticleMutation.start,
    source: { newArticle: $newArticle, visitor: $$sessionModel.$visitor },
    filter: ({ newArticle, visitor }) => Boolean(newArticle && visitor),
    fn: ({ newArticle, visitor }) =>
      ({
        slug: newArticle!.title.split(' ').join('-').toLowerCase(),
        title: newArticle!.title,
        description: newArticle!.description,
        body: newArticle!.body,
        tagList: newArticle?.tagList || [],
        createdAt: new Date(Date.now()).toISOString(),
        updatedAt: new Date(Date.now()).toISOString(),
        favorited: false,
        favoritesCount: 0,
        author: {
          username: visitor!.username,
          bio: visitor!.bio,
          image: visitor!.image,
          following: false,
        },
      } as Article),
    target: mutated,
  });

  sample({
    clock: createArticleMutation.finished.failure,
    fn: ({ error }) => ({ error }),
    target: failure,
  });

  sample({
    clock: createArticleMutation.finished.success,
    fn: ({ result: article }) => article,
    target: success,
  });

  return {
    create,
    mutated,
    failure,
    success,
    $pending: createArticleMutation.$pending,
  };
}
