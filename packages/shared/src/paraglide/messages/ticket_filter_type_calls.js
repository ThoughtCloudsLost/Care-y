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

const en_xa2_ticket_filter_type_calls = /** @type {(inputs: Ticket_Filter_Type_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè Càlls ••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone Calls" |
*
* @param {Ticket_Filter_Type_CallsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_calls = /** @type {((inputs?: Ticket_Filter_Type_CallsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_CallsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_calls(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_calls(inputs)
	return en_ticket_filter_type_calls(inputs)
});