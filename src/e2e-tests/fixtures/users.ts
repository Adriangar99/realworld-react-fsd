/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import { Browser } from '@playwright/test';

export type User = {
  name: string;
  email: string;
  password: string;
  path: string;
};

async function createContext(
  browser: Browser,
  storageState: string,
  baseURL?: string,
) {
  let localstorage: string | undefined;

  if (fs.existsSync(storageState)) {
    localstorage = storageState;
  }

  const context = await browser.newContext({
    storageState: localstorage,
    ...(baseURL ? { baseURL } : {}),
  });
  const page = await context.newPage();
  return {
    page,
    context,
  };
}

export function userForIndex(id: string | number) {
  const user: User = {
    name: `Person ${id}`,
    email: `person+${id}@example.com`,
    password: '123456789',
    path: `playwright/.auth/${id}.json`,
  };
  return {
    ...user,
    instance: (browser: Browser, baseURL?: string) =>
      createContext(browser, user.path, baseURL),
  };
}
