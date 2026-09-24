/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Tickets_Sort_QueueInputs */

const en_tickets_sort_queue = /** @type {(inputs: Tickets_Sort_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const es_tickets_sort_queue = /** @type {(inputs: Tickets_Sort_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const en_xa2_tickets_sort_queue = /** @type {(inputs: Tickets_Sort_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Tickets_Sort_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_queue = /** @type {((inputs: Tickets_Sort_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_sort_queue(inputs)
	if (locale === "en-XA") return en_xa2_tickets_sort_queue(inputs)
	return en_tickets_sort_queue(inputs)
});