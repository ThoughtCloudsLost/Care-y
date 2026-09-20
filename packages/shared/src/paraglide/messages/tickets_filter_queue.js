/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Tickets_Filter_QueueInputs */

const en_tickets_filter_queue = /** @type {(inputs: Tickets_Filter_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const es_tickets_filter_queue = /** @type {(inputs: Tickets_Filter_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const en_xa2_tickets_filter_queue = /** @type {(inputs: Tickets_Filter_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Tickets_Filter_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_queue = /** @type {((inputs: Tickets_Filter_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_queue(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_queue(inputs)
	return en_tickets_filter_queue(inputs)
});