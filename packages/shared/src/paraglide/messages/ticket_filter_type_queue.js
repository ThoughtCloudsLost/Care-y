/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_QueueInputs */

const en_ticket_filter_type_queue = /** @type {(inputs: Ticket_Filter_Type_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue Changes`)
};

const es_ticket_filter_type_queue = /** @type {(inputs: Ticket_Filter_Type_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios de cola`)
};

/**
* | output |
* | --- |
* | "Queue Changes" |
*
* @param {Ticket_Filter_Type_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_queue = /** @type {((inputs?: Ticket_Filter_Type_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_queue(inputs)
	return en_ticket_filter_type_queue(inputs)
});