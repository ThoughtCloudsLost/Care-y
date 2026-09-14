/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_Plaintext_WarningInputs */

const en_ticket_email_plaintext_warning = /** @type {(inputs: Ticket_Email_Plaintext_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email messages are not encrypted.`)
};

const es_ticket_email_plaintext_warning = /** @type {(inputs: Ticket_Email_Plaintext_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los correos electrónicos no están cifrados.`)
};

/**
* | output |
* | --- |
* | "Email messages are not encrypted." |
*
* @param {Ticket_Email_Plaintext_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_plaintext_warning = /** @type {((inputs?: Ticket_Email_Plaintext_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Plaintext_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_plaintext_warning(inputs)
	return en_ticket_email_plaintext_warning(inputs)
});