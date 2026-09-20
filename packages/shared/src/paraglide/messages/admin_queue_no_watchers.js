/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_No_WatchersInputs */

const en_admin_queue_no_watchers = /** @type {(inputs: Admin_Queue_No_WatchersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No watchers`)
};

const es_admin_queue_no_watchers = /** @type {(inputs: Admin_Queue_No_WatchersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin observadores`)
};

/**
* | output |
* | --- |
* | "No watchers" |
*
* @param {Admin_Queue_No_WatchersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_no_watchers = /** @type {((inputs?: Admin_Queue_No_WatchersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_No_WatchersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_no_watchers(inputs)
	return en_admin_queue_no_watchers(inputs)
});