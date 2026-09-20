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

const en_xa2_ticket_voicemail_progress = /** @type {(inputs: Ticket_Voicemail_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.current} òf  ••${i?.total}⟧`)
};

/**
* | output |
* | --- |
* | "{current} of {total}" |
*
* @param {Ticket_Voicemail_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_progress = /** @type {((inputs: Ticket_Voicemail_ProgressInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_ProgressInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_voicemail_progress(inputs)
	if (locale === "en-XA") return en_xa2_ticket_voicemail_progress(inputs)
	return en_ticket_voicemail_progress(inputs)
});