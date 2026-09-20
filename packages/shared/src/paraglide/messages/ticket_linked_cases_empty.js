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

/**
* | output |
* | --- |
* | "No linked {tickets}." |
*
* @param {Ticket_Linked_Cases_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_linked_cases_empty = /** @type {((inputs: Ticket_Linked_Cases_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Linked_Cases_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_linked_cases_empty(inputs)
	return en_ticket_linked_cases_empty(inputs)
});