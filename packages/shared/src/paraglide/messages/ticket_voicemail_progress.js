/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ current: NonNullable<unknown>, total: NonNullable<unknown> }} Ticket_Voicemail_ProgressInputs */

const en_ticket_voicemail_progress = /** @type {(inputs: Ticket_Voicemail_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.current} of ${i?.total}`)
};

const es_ticket_voicemail_progress = /** @type {(inputs: Ticket_Voicemail_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.current} de ${i?.total}`)
};

/**
* | output |
* | --- |
* | "{current} of {total}" |
*
* @param {Ticket_Voicemail_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_progress = /** @type {((inputs: Ticket_Voicemail_ProgressInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_ProgressInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_voicemail_progress(inputs)
	return es_ticket_voicemail_progress(inputs)
});