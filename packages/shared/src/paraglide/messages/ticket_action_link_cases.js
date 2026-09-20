/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, Tickets: NonNullable<unknown> }} Ticket_Action_Link_CasesInputs */

const en_ticket_action_link_cases = /** @type {(inputs: Ticket_Action_Link_CasesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Linked ${i?.tickets}`)
};

const es_ticket_action_link_cases = /** @type {(inputs: Ticket_Action_Link_CasesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets} vinculados`)
};

/**
* | output |
* | --- |
* | "Linked {tickets}" |
*
* @param {Ticket_Action_Link_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_link_cases = /** @type {((inputs: Ticket_Action_Link_CasesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_Link_CasesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_link_cases(inputs)
	return en_ticket_action_link_cases(inputs)
});