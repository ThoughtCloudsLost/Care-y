/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_QueueInputs */

const en_tickets_filter_queue = /** @type {(inputs: Tickets_Filter_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue`)
};

const es_tickets_filter_queue = /** @type {(inputs: Tickets_Filter_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cola`)
};

/**
* | output |
* | --- |
* | "Queue" |
*
* @param {Tickets_Filter_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_queue = /** @type {((inputs?: Tickets_Filter_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_queue(inputs)
	return es_tickets_filter_queue(inputs)
});