/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Link_Case_AddedInputs */

const en_ticket_link_case_added = /** @type {(inputs: Ticket_Link_Case_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Linked.`)
};

const es_ticket_link_case_added = /** @type {(inputs: Ticket_Link_Case_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vinculado.`)
};

/**
* | output |
* | --- |
* | "Linked." |
*
* @param {Ticket_Link_Case_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_added = /** @type {((inputs?: Ticket_Link_Case_AddedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Link_Case_AddedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_link_case_added(inputs)
	return en_ticket_link_case_added(inputs)
});