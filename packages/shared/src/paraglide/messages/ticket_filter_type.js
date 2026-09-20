/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_TypeInputs */

const en_ticket_filter_type = /** @type {(inputs: Ticket_Filter_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type`)
};

const es_ticket_filter_type = /** @type {(inputs: Ticket_Filter_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo`)
};

const en_xa2_ticket_filter_type = /** @type {(inputs: Ticket_Filter_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Typè ••⟧`)
};

/**
* | output |
* | --- |
* | "Type" |
*
* @param {Ticket_Filter_TypeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type = /** @type {((inputs?: Ticket_Filter_TypeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_TypeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type(inputs)
	return en_ticket_filter_type(inputs)
});