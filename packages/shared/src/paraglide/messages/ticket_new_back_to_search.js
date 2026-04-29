/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Back_To_SearchInputs */

const en_ticket_new_back_to_search = /** @type {(inputs: Ticket_New_Back_To_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back to search`)
};

const es_ticket_new_back_to_search = /** @type {(inputs: Ticket_New_Back_To_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volver a buscar`)
};

/**
* | output |
* | --- |
* | "Back to search" |
*
* @param {Ticket_New_Back_To_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_back_to_search = /** @type {((inputs?: Ticket_New_Back_To_SearchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Back_To_SearchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_back_to_search(inputs)
	return es_ticket_new_back_to_search(inputs)
});