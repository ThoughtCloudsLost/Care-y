/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Ticket_Linked_Cases_EmptyInputs */

const en_ticket_linked_cases_empty = /** @type {(inputs: Ticket_Linked_Cases_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No linked ${i?.tickets}.`)
};

const es_ticket_linked_cases_empty = /** @type {(inputs: Ticket_Linked_Cases_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sin ${i?.tickets} vinculados.`)
};

const en_xa2_ticket_linked_cases_empty = /** @type {(inputs: Ticket_Linked_Cases_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò lìnkèd  •••${i?.tickets}. •⟧`)
};

/**
* | output |
* | --- |
* | "No linked {tickets}." |
*
* @param {Ticket_Linked_Cases_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_linked_cases_empty = /** @type {((inputs: Ticket_Linked_Cases_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Linked_Cases_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_linked_cases_empty(inputs)
	if (locale === "en-XA") return en_xa2_ticket_linked_cases_empty(inputs)
	return en_ticket_linked_cases_empty(inputs)
});