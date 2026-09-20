/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Priority_NormalInputs */

const en_ticket_new_priority_normal = /** @type {(inputs: Ticket_New_Priority_NormalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Normal`)
};

const es_ticket_new_priority_normal = /** @type {(inputs: Ticket_New_Priority_NormalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Normal`)
};

const en_xa2_ticket_new_priority_normal = /** @type {(inputs: Ticket_New_Priority_NormalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòrmàl ••⟧`)
};

/**
* | output |
* | --- |
* | "Normal" |
*
* @param {Ticket_New_Priority_NormalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_priority_normal = /** @type {((inputs?: Ticket_New_Priority_NormalInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Priority_NormalInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_priority_normal(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_priority_normal(inputs)
	return en_ticket_new_priority_normal(inputs)
});