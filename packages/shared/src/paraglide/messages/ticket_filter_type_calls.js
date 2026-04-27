/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_CallsInputs */

const en_ticket_filter_type_calls = /** @type {(inputs: Ticket_Filter_Type_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone Calls`)
};

const es_ticket_filter_type_calls = /** @type {(inputs: Ticket_Filter_Type_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamadas`)
};

/**
* | output |
* | --- |
* | "Phone Calls" |
*
* @param {Ticket_Filter_Type_CallsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_calls = /** @type {((inputs?: Ticket_Filter_Type_CallsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_CallsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_type_calls(inputs)
	return es_ticket_filter_type_calls(inputs)
});