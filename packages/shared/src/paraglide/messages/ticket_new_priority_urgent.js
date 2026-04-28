/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Priority_UrgentInputs */

const en_ticket_new_priority_urgent = /** @type {(inputs: Ticket_New_Priority_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgent`)
};

const es_ticket_new_priority_urgent = /** @type {(inputs: Ticket_New_Priority_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgente`)
};

/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Ticket_New_Priority_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_priority_urgent = /** @type {((inputs?: Ticket_New_Priority_UrgentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Priority_UrgentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_priority_urgent(inputs)
	return es_ticket_new_priority_urgent(inputs)
});