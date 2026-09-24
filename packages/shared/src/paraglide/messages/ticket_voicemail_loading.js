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

const en_xa2_ticket_voicemail_loading = /** @type {(inputs: Ticket_Voicemail_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàdìng vòìcèmàìl... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Loading voicemail..." |
*
* @param {Ticket_Voicemail_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_loading = /** @type {((inputs?: Ticket_Voicemail_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Voicemail_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_voicemail_loading(inputs)
	if (locale === "en-XA") return en_xa2_ticket_voicemail_loading(inputs)
	return en_ticket_voicemail_loading(inputs)
});