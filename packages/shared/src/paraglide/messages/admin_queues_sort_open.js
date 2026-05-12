/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, Tickets: NonNullable<unknown> }} Admin_Queues_Sort_OpenInputs */

const en_admin_queues_sort_open = /** @type {(inputs: Admin_Queues_Sort_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Open ${i?.tickets}`)
};

const es_admin_queues_sort_open = /** @type {(inputs: Admin_Queues_Sort_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets} abiertos`)
};

/**
* | output |
* | --- |
* | "Open {tickets}" |
*
* @param {Admin_Queues_Sort_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_open = /** @type {((inputs: Admin_Queues_Sort_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Sort_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_sort_open(inputs)
	return es_admin_queues_sort_open(inputs)
});