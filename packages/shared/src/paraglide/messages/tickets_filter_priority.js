/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_PriorityInputs */

const en_tickets_filter_priority = /** @type {(inputs: Tickets_Filter_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority`)
};

/** @type {(inputs: Tickets_Filter_PriorityInputs) => LocalizedString} */
const es_tickets_filter_priority = en_tickets_filter_priority;

/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Tickets_Filter_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_priority = /** @type {((inputs?: Tickets_Filter_PriorityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_PriorityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_priority(inputs)
	return es_tickets_filter_priority(inputs)
});