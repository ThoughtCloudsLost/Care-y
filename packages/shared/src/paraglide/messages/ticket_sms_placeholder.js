/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Sms_PlaceholderInputs */

const en_ticket_sms_placeholder = /** @type {(inputs: Ticket_Sms_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type your message...`)
};

const es_ticket_sms_placeholder = /** @type {(inputs: Ticket_Sms_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe tu mensaje...`)
};

const en_xa2_ticket_sms_placeholder = /** @type {(inputs: Ticket_Sms_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Typè yòùr mèssàgè... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Type your message..." |
*
* @param {Ticket_Sms_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_placeholder = /** @type {((inputs?: Ticket_Sms_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_sms_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_ticket_sms_placeholder(inputs)
	return en_ticket_sms_placeholder(inputs)
});