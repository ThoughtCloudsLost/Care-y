/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Org_Key_ResealInputs */

const en_audit_event_org_key_reseal = /** @type {(inputs: Audit_Event_Org_Key_ResealInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Records re-encrypted`)
};

const es_audit_event_org_key_reseal = /** @type {(inputs: Audit_Event_Org_Key_ResealInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registros cifrados de nuevo`)
};

const en_xa2_audit_event_org_key_reseal = /** @type {(inputs: Audit_Event_Org_Key_ResealInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrds rè-èncryptèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Records re-encrypted" |
*
* @param {Audit_Event_Org_Key_ResealInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_org_key_reseal = /** @type {((inputs?: Audit_Event_Org_Key_ResealInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Org_Key_ResealInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_org_key_reseal(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_org_key_reseal(inputs)
	return en_audit_event_org_key_reseal(inputs)
});