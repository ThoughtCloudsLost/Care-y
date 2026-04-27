/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_ReorderedInputs */

const en_admin_queue_reordered = /** @type {(inputs: Admin_Queue_ReorderedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue order updated`)
};

const es_admin_queue_reordered = /** @type {(inputs: Admin_Queue_ReorderedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Orden de colas actualizado`)
};

/**
* | output |
* | --- |
* | "Queue order updated" |
*
* @param {Admin_Queue_ReorderedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_reordered = /** @type {((inputs?: Admin_Queue_ReorderedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_ReorderedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_reordered(inputs)
	return es_admin_queue_reordered(inputs)
});