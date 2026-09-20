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

const en_xa2_ticket_new_back_to_search = /** @type {(inputs: Ticket_New_Back_To_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàck tò sèàrch •••••⟧`)
};

/**
* | output |
* | --- |
* | "Back to search" |
*
* @param {Ticket_New_Back_To_SearchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_back_to_search = /** @type {((inputs?: Ticket_New_Back_To_SearchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Back_To_SearchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_back_to_search(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_back_to_search(inputs)
	return en_ticket_new_back_to_search(inputs)
});