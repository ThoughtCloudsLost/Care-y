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

const en_xa2_ticket_new_priority_urgent = /** @type {(inputs: Ticket_New_Priority_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùrgènt ••⟧`)
};

/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Ticket_New_Priority_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_priority_urgent = /** @type {((inputs?: Ticket_New_Priority_UrgentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Priority_UrgentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_priority_urgent(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_priority_urgent(inputs)
	return en_ticket_new_priority_urgent(inputs)
});