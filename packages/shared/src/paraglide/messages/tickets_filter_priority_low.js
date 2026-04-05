/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Priority_LowInputs */

const en_tickets_filter_priority_low = /** @type {(inputs: Tickets_Filter_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Low`)
};

const es_tickets_filter_priority_low = /** @type {(inputs: Tickets_Filter_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Baja`)
};

/**
* | output |
* | --- |
* | "Low" |
*
* @param {Tickets_Filter_Priority_LowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_priority_low = /** @type {((inputs?: Tickets_Filter_Priority_LowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Priority_LowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_priority_low(inputs)
	return es_tickets_filter_priority_low(inputs)
});