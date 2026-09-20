/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_Case_DetailsInputs */

const en_ticket_case_details = /** @type {(inputs: Ticket_Case_DetailsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} details`)
};

const es_ticket_case_details = /** @type {(inputs: Ticket_Case_DetailsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Detalles del ${i?.Ticket}`)
};

const en_xa2_ticket_case_details = /** @type {(inputs: Ticket_Case_DetailsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} dètàìls •••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} details" |
*
* @param {Ticket_Case_DetailsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_case_details = /** @type {((inputs: Ticket_Case_DetailsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Case_DetailsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_case_details(inputs)
	if (locale === "en-XA") return en_xa2_ticket_case_details(inputs)
	return en_ticket_case_details(inputs)
});