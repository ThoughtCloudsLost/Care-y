/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Ticket_Link_Case_Remove_ErrorInputs */

const en_ticket_link_case_remove_error = /** @type {(inputs: Ticket_Link_Case_Remove_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Could not unlink ${i?.ticket}.`)
};

const es_ticket_link_case_remove_error = /** @type {(inputs: Ticket_Link_Case_Remove_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se pudo desvincular el ${i?.ticket}.`)
};

const en_xa2_ticket_link_case_remove_error = /** @type {(inputs: Ticket_Link_Case_Remove_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùnlìnk  ••••••${i?.ticket}. •⟧`)
};

/**
* | output |
* | --- |
* | "Could not unlink {ticket}." |
*
* @param {Ticket_Link_Case_Remove_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_remove_error = /** @type {((inputs: Ticket_Link_Case_Remove_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Link_Case_Remove_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_link_case_remove_error(inputs)
	if (locale === "en-XA") return en_xa2_ticket_link_case_remove_error(inputs)
	return en_ticket_link_case_remove_error(inputs)
});