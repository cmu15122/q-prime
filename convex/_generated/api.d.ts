/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as common from "../common.js";
import type * as home_home_get from "../home/home_get.js";
import type * as home_home_mutate from "../home/home_mutate.js";
import type * as settings_settings_get from "../settings/settings_get.js";
import type * as settings_settings_mutate from "../settings/settings_mutate.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  common: typeof common;
  "home/home_get": typeof home_home_get;
  "home/home_mutate": typeof home_home_mutate;
  "settings/settings_get": typeof settings_settings_get;
  "settings/settings_mutate": typeof settings_settings_mutate;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
