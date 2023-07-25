import { createEvent, sample } from 'effector';
import { string } from 'zod';
import { $$sessionModel, sessionApi } from '~entities/session';
import { createQuery } from '~shared/api/createQuery';
import { createFormModel } from '~shared/lib/form';

export type RegisterFormModel = Omit<
  ReturnType<typeof createRegisterFormModel>,
  'initialize'
>;

export function createRegisterFormModel() {
  const initialize = createEvent();
  const submitted = createEvent();
  const unmounted = createEvent();

  // const toHomeFx = attach({
  //   source: $ctx,
  //   effect: (ctx) => ctx.router.navigate('/'),
  // });

  const $$registerForm = createFormModel({
    fields: {
      username: {
        initialValue: '',
        validationSchema: string().min(3),
      },
      email: {
        initialValue: '',
        validationSchema: string().min(3),
      },
      password: {
        initialValue: '',
        validationSchema: string().min(3),
      },
    },
  });

  const $$newUserQuery = createQuery({
    fx: sessionApi.createUserFx,
    name: 'newUserQuery',
  });

  sample({
    clock: initialize,
    target: [$$newUserQuery.reset, $$registerForm.reset],
  });

  sample({
    clock: submitted,
    target: $$registerForm.validate,
  });

  sample({
    clock: $$registerForm.validated.success,
    source: $$registerForm.$form,
    fn: (user) => ({ user, params: { cancelToken: 'newUserQuery' } }),
    target: $$newUserQuery.start,
  });

  sample({
    clock: $$newUserQuery.finished.success,
    target: $$sessionModel.update,
  });

  sample({
    clock: unmounted,
    target: $$newUserQuery.abort,
  });

  return {
    initialize,
    submitted,
    unmounted,
    fields: $$registerForm.fields,
    $response: $$newUserQuery.$response,
  };
}
