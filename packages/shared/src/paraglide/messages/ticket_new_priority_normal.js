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

/**
* | output |
* | --- |
* | "Normal" |
*
* @param {Ticket_New_Priority_NormalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_priority_normal = /** @type {((inputs?: Ticket_New_Priority_NormalInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Priority_NormalInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_priority_normal(inputs)
	return es_ticket_new_priority_normal(inputs)
});