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

/**
* | output |
* | --- |
* | "Type your message..." |
*
* @param {Ticket_Sms_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_placeholder = /** @type {((inputs?: Ticket_Sms_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_sms_placeholder(inputs)
	return es_ticket_sms_placeholder(inputs)
});