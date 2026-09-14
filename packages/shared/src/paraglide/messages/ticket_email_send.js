/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_SendInputs */

const en_ticket_email_send = /** @type {(inputs: Ticket_Email_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send email`)
};

const es_ticket_email_send = /** @type {(inputs: Ticket_Email_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar correo`)
};

/**
* | output |
* | --- |
* | "Send email" |
*
* @param {Ticket_Email_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_send = /** @type {((inputs?: Ticket_Email_SendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_SendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_send(inputs)
	return en_ticket_email_send(inputs)
});