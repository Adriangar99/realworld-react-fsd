/* eslint-disable import/no-extraneous-dependencies */
import { test as base, Page } from '@playwright/test';
import { User, userForIndex } from './fixtures/users';

export * from '@playwright/test';

// eslint-disable-next-line no-use-before-define
const getParallelIndex = () => test.info().parallelIndex;

const loginOrSignUp = async ({ page, user }: { page: Page; user: User }) => {
    try {
        await page.goto('/');
        await page.getByText('Your Feed').waitFor({ timeout: 300 });
    } catch {
        await page.goto('/login');
        await page.getByPlaceholder(/email/i).fill(user.email);
        await page.getByPlaceholder(/password/i).fill(user.password);
        await page
            .getByRole('button', {
                name: 'Sign in',
            })
            .click();
        try {
            await page.waitForURL(/profile/i, { timeout: 300 });
        } catch (error) {
            await page.goto('/register');
            await page.getByPlaceholder(/name/i).fill(user.name);
            await page.getByPlaceholder(/email/i).fill(user.email);
            await page.getByPlaceholder(/password/i).fill(user.password);
            await page
                .getByRole('button', {
                    name: 'Sign up',
                })
                .click();
        }
    }
};

export const test = base.extend<
    { user: User },
    { workerStorageState: string }
>({
    storageState: ({ workerStorageState }, use) => use(workerStorageState),
    user: async ({ page: _ }, use) => {
        const id = getParallelIndex();
        const user = userForIndex(id);
        await use(user);
    },
    workerStorageState: [
        async ({ browser }, use) => {
            const id = getParallelIndex();
            const user = userForIndex(id);
            const app = await user.instance(browser, 'http://localhost:5173');
            await loginOrSignUp({ page: app.page, user });
            await app.page.context().storageState({ path: user.path });
            await use(user.path);
            await app.context.close();
        },
        { scope: 'worker' },
    ],
});
