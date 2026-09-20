/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Queue_Remove_WatcherInputs */

const en_admin_queue_remove_watcher = /** @type {(inputs: Admin_Queue_Remove_WatcherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Remove ${i?.name} from watchers`)
};

const es_admin_queue_remove_watcher = /** @type {(inputs: Admin_Queue_Remove_WatcherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Quitar a ${i?.name} de los observadores`)
};

const en_xa2_admin_queue_remove_watcher = /** @type {(inputs: Admin_Queue_Remove_WatcherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè  •••${i?.name} fròm wàtchèrs •••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove {name} from watchers" |
*
* @param {Admin_Queue_Remove_WatcherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_remove_watcher = /** @type {((inputs: Admin_Queue_Remove_WatcherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Remove_WatcherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_remove_watcher(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_remove_watcher(inputs)
	return en_admin_queue_remove_watcher(inputs)
});