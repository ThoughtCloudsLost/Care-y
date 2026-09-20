/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Watcher_AddedInputs */

const en_admin_queue_watcher_added = /** @type {(inputs: Admin_Queue_Watcher_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Watcher added`)
};

const es_admin_queue_watcher_added = /** @type {(inputs: Admin_Queue_Watcher_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Observador agregado`)
};

/**
* | output |
* | --- |
* | "Watcher added" |
*
* @param {Admin_Queue_Watcher_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watcher_added = /** @type {((inputs?: Admin_Queue_Watcher_AddedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Watcher_AddedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_watcher_added(inputs)
	return en_admin_queue_watcher_added(inputs)
});