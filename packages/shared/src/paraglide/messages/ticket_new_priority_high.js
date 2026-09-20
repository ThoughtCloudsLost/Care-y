/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Priority_HighInputs */

const en_ticket_new_priority_high = /** @type {(inputs: Ticket_New_Priority_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High`)
};

const es_ticket_new_priority_high = /** @type {(inputs: Ticket_New_Priority_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alta`)
};

const en_xa2_ticket_new_priority_high = /** @type {(inputs: Ticket_New_Priority_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hìgh ••⟧`)
};

/**
* | output |
* | --- |
* | "High" |
*
* @param {Ticket_New_Priority_HighInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_priority_high = /** @type {((inputs?: Ticket_New_Priority_HighInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Priority_HighInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_priority_high(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_priority_high(inputs)
	return en_ticket_new_priority_high(inputs)
});