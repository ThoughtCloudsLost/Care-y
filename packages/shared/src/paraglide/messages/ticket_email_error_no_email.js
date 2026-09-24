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

const en_xa2_ticket_email_error_no_email = /** @type {(inputs: Ticket_Email_Error_No_EmailInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò èmàìl àddrèss òn fìlè fòr thìs  •••••••••••${i?.client}. •⟧`)
};

/**
* | output |
* | --- |
* | "No email address on file for this {client}." |
*
* @param {Ticket_Email_Error_No_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_error_no_email = /** @type {((inputs: Ticket_Email_Error_No_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Error_No_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_error_no_email(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_error_no_email(inputs)
	return en_ticket_email_error_no_email(inputs)
});