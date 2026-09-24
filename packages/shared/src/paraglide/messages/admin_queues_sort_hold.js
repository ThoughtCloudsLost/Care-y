/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_Sort_HoldInputs */

const en_admin_queues_sort_hold = /** @type {(inputs: Admin_Queues_Sort_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On hold`)
};

const es_admin_queues_sort_hold = /** @type {(inputs: Admin_Queues_Sort_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En espera`)
};

const en_xa2_admin_queues_sort_hold = /** @type {(inputs: Admin_Queues_Sort_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òn hòld •••⟧`)
};

/**
* | output |
* | --- |
* | "On hold" |
*
* @param {Admin_Queues_Sort_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_hold = /** @type {((inputs?: Admin_Queues_Sort_HoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Sort_HoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_sort_hold(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_sort_hold(inputs)
	return en_admin_queues_sort_hold(inputs)
});