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

/**
* | output |
* | --- |
* | "High" |
*
* @param {Ticket_New_Priority_HighInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_priority_high = /** @type {((inputs?: Ticket_New_Priority_HighInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Priority_HighInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_priority_high(inputs)
	return es_ticket_new_priority_high(inputs)
});