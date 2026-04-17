/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_DeleteInputs */

const en_admin_queue_delete = /** @type {(inputs: Admin_Queue_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete queue`)
};

const es_admin_queue_delete = /** @type {(inputs: Admin_Queue_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar cola`)
};

/**
* | output |
* | --- |
* | "Delete queue" |
*
* @param {Admin_Queue_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete = /** @type {((inputs?: Admin_Queue_DeleteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_DeleteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_delete(inputs)
	return es_admin_queue_delete(inputs)
});