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

const en_xa2_admin_queues_sort_open = /** @type {(inputs: Admin_Queues_Sort_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Òpèn  ••${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Open {tickets}" |
*
* @param {Admin_Queues_Sort_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_open = /** @type {((inputs: Admin_Queues_Sort_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Sort_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_sort_open(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_sort_open(inputs)
	return en_admin_queues_sort_open(inputs)
});