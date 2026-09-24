/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Add_Watcher_ButtonInputs */

const en_admin_queue_add_watcher_button = /** @type {(inputs: Admin_Queue_Add_Watcher_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add watcher`)
};

const es_admin_queue_add_watcher_button = /** @type {(inputs: Admin_Queue_Add_Watcher_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar observador`)
};

const en_xa2_admin_queue_add_watcher_button = /** @type {(inputs: Admin_Queue_Add_Watcher_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd wàtchèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Add watcher" |
*
* @param {Admin_Queue_Add_Watcher_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_add_watcher_button = /** @type {((inputs?: Admin_Queue_Add_Watcher_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Add_Watcher_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_add_watcher_button(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_add_watcher_button(inputs)
	return en_admin_queue_add_watcher_button(inputs)
});