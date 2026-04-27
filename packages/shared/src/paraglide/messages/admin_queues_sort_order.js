/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_Sort_OrderInputs */

const en_admin_queues_sort_order = /** @type {(inputs: Admin_Queues_Sort_OrderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Custom order`)
};

const es_admin_queues_sort_order = /** @type {(inputs: Admin_Queues_Sort_OrderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Orden personalizado`)
};

/**
* | output |
* | --- |
* | "Custom order" |
*
* @param {Admin_Queues_Sort_OrderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_order = /** @type {((inputs?: Admin_Queues_Sort_OrderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Sort_OrderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_sort_order(inputs)
	return es_admin_queues_sort_order(inputs)
});