/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown> }} Ticket_New_Field_ClientInputs */

const en_ticket_new_field_client = /** @type {(inputs: Ticket_New_Field_ClientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client}`)
};

const es_ticket_new_field_client = /** @type {(inputs: Ticket_New_Field_ClientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client}`)
};

const en_xa2_ticket_new_field_client = /** @type {(inputs: Ticket_New_Field_ClientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client}⟧`)
};

/**
* | output |
* | --- |
* | "{Client}" |
*
* @param {Ticket_New_Field_ClientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_client = /** @type {((inputs: Ticket_New_Field_ClientInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_ClientInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_field_client(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_field_client(inputs)
	return en_ticket_new_field_client(inputs)
});