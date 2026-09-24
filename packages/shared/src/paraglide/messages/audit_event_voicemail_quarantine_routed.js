/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Voicemail_Quarantine_RoutedInputs */

const en_audit_event_voicemail_quarantine_routed = /** @type {(inputs: Audit_Event_Voicemail_Quarantine_RoutedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail quarantine routed`)
};

const es_audit_event_voicemail_quarantine_routed = /** @type {(inputs: Audit_Event_Voicemail_Quarantine_RoutedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuarentena de mensaje de voz redirigida`)
};

const en_xa2_audit_event_voicemail_quarantine_routed = /** @type {(inputs: Audit_Event_Voicemail_Quarantine_RoutedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìl qùàràntìnè ròùtèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Voicemail quarantine routed" |
*
* @param {Audit_Event_Voicemail_Quarantine_RoutedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantine_routed = /** @type {((inputs?: Audit_Event_Voicemail_Quarantine_RoutedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Voicemail_Quarantine_RoutedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_voicemail_quarantine_routed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_voicemail_quarantine_routed(inputs)
	return en_audit_event_voicemail_quarantine_routed(inputs)
});