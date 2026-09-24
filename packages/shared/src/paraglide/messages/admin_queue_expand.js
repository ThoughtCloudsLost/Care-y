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

const en_xa2_admin_queue_expand = /** @type {(inputs: Admin_Queue_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shòw mèmbèrs ••••⟧`)
};

/**
* | output |
* | --- |
* | "Show members" |
*
* @param {Admin_Queue_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_expand = /** @type {((inputs?: Admin_Queue_ExpandInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_ExpandInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_expand(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_expand(inputs)
	return en_admin_queue_expand(inputs)
});