/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} Ticket_Assign_SearchInputs */

const en_ticket_assign_search = /** @type {(inputs: Ticket_Assign_SearchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Search ${i?.volunteers}...`)
};

const es_ticket_assign_search = /** @type {(inputs: Ticket_Assign_SearchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscar ${i?.volunteers}...`)
};

const en_xa2_ticket_assign_search = /** @type {(inputs: Ticket_Assign_SearchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch  •••${i?.volunteers}... •⟧`)
};

/**
* | output |
* | --- |
* | "Search {volunteers}..." |
*
* @param {Ticket_Assign_SearchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_assign_search = /** @type {((inputs: Ticket_Assign_SearchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Assign_SearchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_assign_search(inputs)
	if (locale === "en-XA") return en_xa2_ticket_assign_search(inputs)
	return en_ticket_assign_search(inputs)
});