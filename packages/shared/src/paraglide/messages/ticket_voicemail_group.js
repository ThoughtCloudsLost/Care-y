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

const en_xa2_ticket_voicemail_group = /** @type {(inputs: Ticket_Voicemail_GroupInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìl,  ••••${i?.duration}⟧`)
};

/**
* | output |
* | --- |
* | "Voicemail, {duration}" |
*
* @param {Ticket_Voicemail_GroupInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_group = /** @type {((inputs: Ticket_Voicemail_GroupInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_GroupInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_voicemail_group(inputs)
	if (locale === "en-XA") return en_xa2_ticket_voicemail_group(inputs)
	return en_ticket_voicemail_group(inputs)
});