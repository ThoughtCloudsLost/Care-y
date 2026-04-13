/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ duration: NonNullable<unknown> }} Ticket_Voicemail_GroupInputs */

const en_ticket_voicemail_group = /** @type {(inputs: Ticket_Voicemail_GroupInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Voicemail, ${i?.duration}`)
};

const es_ticket_voicemail_group = /** @type {(inputs: Ticket_Voicemail_GroupInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mensaje de voz, ${i?.duration}`)
};

/**
* | output |
* | --- |
* | "Voicemail, {duration}" |
*
* @param {Ticket_Voicemail_GroupInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_group = /** @type {((inputs: Ticket_Voicemail_GroupInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_GroupInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_voicemail_group(inputs)
	return es_ticket_voicemail_group(inputs)
});