/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Voicemail_Quarantine_DismissedInputs */

const en_audit_event_voicemail_quarantine_dismissed = /** @type {(inputs: Audit_Event_Voicemail_Quarantine_DismissedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail quarantine dismissed`)
};

const es_audit_event_voicemail_quarantine_dismissed = /** @type {(inputs: Audit_Event_Voicemail_Quarantine_DismissedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuarentena de mensaje de voz descartada`)
};

const en_xa2_audit_event_voicemail_quarantine_dismissed = /** @type {(inputs: Audit_Event_Voicemail_Quarantine_DismissedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìl qùàràntìnè dìsmìssèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Voicemail quarantine dismissed" |
*
* @param {Audit_Event_Voicemail_Quarantine_DismissedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantine_dismissed = /** @type {((inputs?: Audit_Event_Voicemail_Quarantine_DismissedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Voicemail_Quarantine_DismissedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_voicemail_quarantine_dismissed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_voicemail_quarantine_dismissed(inputs)
	return en_audit_event_voicemail_quarantine_dismissed(inputs)
});