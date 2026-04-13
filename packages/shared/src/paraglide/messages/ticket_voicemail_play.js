/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Voicemail_PlayInputs */

const en_ticket_voicemail_play = /** @type {(inputs: Ticket_Voicemail_PlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Play voicemail`)
};

const es_ticket_voicemail_play = /** @type {(inputs: Ticket_Voicemail_PlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reproducir mensaje de voz`)
};

/**
* | output |
* | --- |
* | "Play voicemail" |
*
* @param {Ticket_Voicemail_PlayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_play = /** @type {((inputs?: Ticket_Voicemail_PlayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_PlayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_voicemail_play(inputs)
	return es_ticket_voicemail_play(inputs)
});