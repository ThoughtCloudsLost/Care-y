/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Sms_Plaintext_WarningInputs */

const en_ticket_sms_plaintext_warning = /** @type {(inputs: Ticket_Sms_Plaintext_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS messages are not encrypted.`)
};

const es_ticket_sms_plaintext_warning = /** @type {(inputs: Ticket_Sms_Plaintext_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los mensajes SMS no estan cifrados.`)
};

/**
* | output |
* | --- |
* | "SMS messages are not encrypted." |
*
* @param {Ticket_Sms_Plaintext_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_plaintext_warning = /** @type {((inputs?: Ticket_Sms_Plaintext_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_Plaintext_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_sms_plaintext_warning(inputs)
	return es_ticket_sms_plaintext_warning(inputs)
});