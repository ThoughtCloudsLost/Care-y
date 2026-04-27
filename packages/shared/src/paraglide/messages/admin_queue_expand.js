/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_ExpandInputs */

const en_admin_queue_expand = /** @type {(inputs: Admin_Queue_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show members`)
};

const es_admin_queue_expand = /** @type {(inputs: Admin_Queue_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrar miembros`)
};

/**
* | output |
* | --- |
* | "Show members" |
*
* @param {Admin_Queue_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_expand = /** @type {((inputs?: Admin_Queue_ExpandInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_ExpandInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_expand(inputs)
	return es_admin_queue_expand(inputs)
});