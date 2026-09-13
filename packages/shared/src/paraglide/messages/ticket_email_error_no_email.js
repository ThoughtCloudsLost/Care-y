/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_Email_Error_No_EmailInputs */

const en_ticket_email_error_no_email = /** @type {(inputs: Ticket_Email_Error_No_EmailInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No email address on file for this ${i?.client}.`)
};

const es_ticket_email_error_no_email = /** @type {(inputs: Ticket_Email_Error_No_EmailInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No hay dirección de correo registrada para este ${i?.client}.`)
};

/**
* | output |
* | --- |
* | "No email address on file for this {client}." |
*
* @param {Ticket_Email_Error_No_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_error_no_email = /** @type {((inputs: Ticket_Email_Error_No_EmailInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Error_No_EmailInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_email_error_no_email(inputs)
	return es_ticket_email_error_no_email(inputs)
});