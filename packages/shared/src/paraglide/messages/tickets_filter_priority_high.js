/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Priority_HighInputs */

const en_tickets_filter_priority_high = /** @type {(inputs: Tickets_Filter_Priority_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High`)
};

/** @type {(inputs: Tickets_Filter_Priority_HighInputs) => LocalizedString} */
const es_tickets_filter_priority_high = en_tickets_filter_priority_high;

/**
* | output |
* | --- |
* | "High" |
*
* @param {Tickets_Filter_Priority_HighInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_priority_high = /** @type {((inputs?: Tickets_Filter_Priority_HighInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Priority_HighInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_priority_high(inputs)
	return es_tickets_filter_priority_high(inputs)
});