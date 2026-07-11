/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Case_DetailsInputs */

const en_ticket_case_details = /** @type {(inputs: Ticket_Case_DetailsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Case details`)
};

const es_ticket_case_details = /** @type {(inputs: Ticket_Case_DetailsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalles del caso`)
};

/**
* | output |
* | --- |
* | "Case details" |
*
* @param {Ticket_Case_DetailsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_case_details = /** @type {((inputs?: Ticket_Case_DetailsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Case_DetailsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_case_details(inputs)
	return es_ticket_case_details(inputs)
});