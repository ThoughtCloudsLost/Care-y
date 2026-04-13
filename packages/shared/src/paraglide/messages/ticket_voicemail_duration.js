/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ duration: NonNullable<unknown> }} Ticket_Voicemail_DurationInputs */

const en_ticket_voicemail_duration = /** @type {(inputs: Ticket_Voicemail_DurationInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.duration} seconds`)
};

const es_ticket_voicemail_duration = /** @type {(inputs: Ticket_Voicemail_DurationInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.duration} segundos`)
};

/**
* | output |
* | --- |
* | "{duration} seconds" |
*
* @param {Ticket_Voicemail_DurationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_duration = /** @type {((inputs: Ticket_Voicemail_DurationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_DurationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_voicemail_duration(inputs)
	return es_ticket_voicemail_duration(inputs)
});