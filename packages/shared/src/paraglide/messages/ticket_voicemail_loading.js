/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Voicemail_LoadingInputs */

const en_ticket_voicemail_loading = /** @type {(inputs: Ticket_Voicemail_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading voicemail...`)
};

const es_ticket_voicemail_loading = /** @type {(inputs: Ticket_Voicemail_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando mensaje de voz...`)
};

/**
* | output |
* | --- |
* | "Loading voicemail..." |
*
* @param {Ticket_Voicemail_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_loading = /** @type {((inputs?: Ticket_Voicemail_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_voicemail_loading(inputs)
	return es_ticket_voicemail_loading(inputs)
});