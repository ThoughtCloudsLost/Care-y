/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Watcher_RemovedInputs */

const en_admin_queue_watcher_removed = /** @type {(inputs: Admin_Queue_Watcher_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Watcher removed`)
};

const es_admin_queue_watcher_removed = /** @type {(inputs: Admin_Queue_Watcher_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Observador eliminado`)
};

/**
* | output |
* | --- |
* | "Watcher removed" |
*
* @param {Admin_Queue_Watcher_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watcher_removed = /** @type {((inputs?: Admin_Queue_Watcher_RemovedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Watcher_RemovedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_watcher_removed(inputs)
	return en_admin_queue_watcher_removed(inputs)
});