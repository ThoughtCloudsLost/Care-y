/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Voicemail_PauseInputs */

const en_ticket_voicemail_pause = /** @type {(inputs: Ticket_Voicemail_PauseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pause voicemail`)
};

const es_ticket_voicemail_pause = /** @type {(inputs: Ticket_Voicemail_PauseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pausar mensaje de voz`)
};

/**
* | output |
* | --- |
* | "Pause voicemail" |
*
* @param {Ticket_Voicemail_PauseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_pause = /** @type {((inputs?: Ticket_Voicemail_PauseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_PauseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_voicemail_pause(inputs)
	return es_ticket_voicemail_pause(inputs)
});