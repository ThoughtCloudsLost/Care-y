/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_Sort_ClosedInputs */

const en_admin_queues_sort_closed = /** @type {(inputs: Admin_Queues_Sort_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closed tickets`)
};

const es_admin_queues_sort_closed = /** @type {(inputs: Admin_Queues_Sort_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets cerrados`)
};

/**
* | output |
* | --- |
* | "Closed tickets" |
*
* @param {Admin_Queues_Sort_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_closed = /** @type {((inputs?: Admin_Queues_Sort_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Sort_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_sort_closed(inputs)
	return es_admin_queues_sort_closed(inputs)
});