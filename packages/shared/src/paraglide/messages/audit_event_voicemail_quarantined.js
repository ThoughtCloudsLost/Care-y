/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Voicemail_QuarantinedInputs */

const en_audit_event_voicemail_quarantined = /** @type {(inputs: Audit_Event_Voicemail_QuarantinedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail quarantined`)
};

const es_audit_event_voicemail_quarantined = /** @type {(inputs: Audit_Event_Voicemail_QuarantinedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje de voz en cuarentena`)
};

/**
* | output |
* | --- |
* | "Voicemail quarantined" |
*
* @param {Audit_Event_Voicemail_QuarantinedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantined = /** @type {((inputs?: Audit_Event_Voicemail_QuarantinedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Voicemail_QuarantinedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_voicemail_quarantined(inputs)
	return es_audit_event_voicemail_quarantined(inputs)
});