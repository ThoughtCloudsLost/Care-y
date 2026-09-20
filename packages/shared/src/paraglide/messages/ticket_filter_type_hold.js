/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_HoldInputs */

const en_ticket_filter_type_hold = /** @type {(inputs: Ticket_Filter_Type_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hold Changes`)
};

const es_ticket_filter_type_hold = /** @type {(inputs: Ticket_Filter_Type_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios de espera`)
};

const en_xa2_ticket_filter_type_hold = /** @type {(inputs: Ticket_Filter_Type_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòld Chàngès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Hold Changes" |
*
* @param {Ticket_Filter_Type_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_hold = /** @type {((inputs?: Ticket_Filter_Type_HoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_HoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_hold(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_hold(inputs)
	return en_ticket_filter_type_hold(inputs)
});