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

const en_xa2_audit_event_voicemail_quarantined = /** @type {(inputs: Audit_Event_Voicemail_QuarantinedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìl qùàràntìnèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Voicemail quarantined" |
*
* @param {Audit_Event_Voicemail_QuarantinedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantined = /** @type {((inputs?: Audit_Event_Voicemail_QuarantinedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Voicemail_QuarantinedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_voicemail_quarantined(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_voicemail_quarantined(inputs)
	return en_audit_event_voicemail_quarantined(inputs)
});