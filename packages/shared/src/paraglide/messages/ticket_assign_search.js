/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Assign_SearchInputs */

const en_ticket_assign_search = /** @type {(inputs: Ticket_Assign_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search volunteers...`)
};

const es_ticket_assign_search = /** @type {(inputs: Ticket_Assign_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar voluntarios...`)
};

/**
* | output |
* | --- |
* | "Search volunteers..." |
*
* @param {Ticket_Assign_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_assign_search = /** @type {((inputs?: Ticket_Assign_SearchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Assign_SearchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_assign_search(inputs)
	return es_ticket_assign_search(inputs)
});