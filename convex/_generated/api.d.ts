/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as auth from "../auth.js";
import type * as common from "../common.js";
import type * as cron from "../cron.js";
import type * as home_home_get from "../home/home_get.js";
import type * as home_home_mutate from "../home/home_mutate.js";
import type * as http from "../http.js";
import type * as metrics from "../metrics.js";
import type * as settings_settings_get from "../settings/settings_get.js";
import type * as settings_settings_mutate from "../settings/settings_mutate.js";
import type * as util_time from "../util/time.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  auth: typeof auth;
  common: typeof common;
  cron: typeof cron;
  "home/home_get": typeof home_home_get;
  "home/home_mutate": typeof home_home_mutate;
  http: typeof http;
  metrics: typeof metrics;
  "settings/settings_get": typeof settings_settings_get;
  "settings/settings_mutate": typeof settings_settings_mutate;
  "util/time": typeof util_time;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
