/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Voicemail_ErrorInputs */

const en_ticket_voicemail_error = /** @type {(inputs: Ticket_Voicemail_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not load voicemail.`)
};

const es_ticket_voicemail_error = /** @type {(inputs: Ticket_Voicemail_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo cargar el mensaje de voz.`)
};

/**
* | output |
* | --- |
* | "Could not load voicemail." |
*
* @param {Ticket_Voicemail_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_error = /** @type {((inputs?: Ticket_Voicemail_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_voicemail_error(inputs)
	return es_ticket_voicemail_error(inputs)
});