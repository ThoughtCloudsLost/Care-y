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

/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Tickets_Sort_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_queue = /** @type {((inputs: Tickets_Sort_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_sort_queue(inputs)
	return es_tickets_sort_queue(inputs)
});