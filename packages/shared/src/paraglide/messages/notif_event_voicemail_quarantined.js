/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Voicemail_QuarantinedInputs */

const en_notif_event_voicemail_quarantined = /** @type {(inputs: Notif_Event_Voicemail_QuarantinedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail`)
};

const es_notif_event_voicemail_quarantined = /** @type {(inputs: Notif_Event_Voicemail_QuarantinedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo de voz`)
};

/**
* | output |
* | --- |
* | "Voicemail" |
*
* @param {Notif_Event_Voicemail_QuarantinedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_voicemail_quarantined = /** @type {((inputs?: Notif_Event_Voicemail_QuarantinedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Voicemail_QuarantinedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_event_voicemail_quarantined(inputs)
	return es_notif_event_voicemail_quarantined(inputs)
});