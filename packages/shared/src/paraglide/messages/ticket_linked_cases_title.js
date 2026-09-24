/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, Tickets: NonNullable<unknown> }} Ticket_Linked_Cases_TitleInputs */

const en_ticket_linked_cases_title = /** @type {(inputs: Ticket_Linked_Cases_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Linked ${i?.tickets}`)
};

const es_ticket_linked_cases_title = /** @type {(inputs: Ticket_Linked_Cases_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets} vinculados`)
};

const en_xa2_ticket_linked_cases_title = /** @type {(inputs: Ticket_Linked_Cases_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Lìnkèd  •••${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Linked {tickets}" |
*
* @param {Ticket_Linked_Cases_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_linked_cases_title = /** @type {((inputs: Ticket_Linked_Cases_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Linked_Cases_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_linked_cases_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_linked_cases_title(inputs)
	return en_ticket_linked_cases_title(inputs)
});