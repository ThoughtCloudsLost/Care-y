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

/**
* | output |
* | --- |
* | "Voicemail quarantine routed" |
*
* @param {Audit_Event_Voicemail_Quarantine_RoutedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantine_routed = /** @type {((inputs?: Audit_Event_Voicemail_Quarantine_RoutedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Voicemail_Quarantine_RoutedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_voicemail_quarantine_routed(inputs)
	return es_audit_event_voicemail_quarantine_routed(inputs)
});