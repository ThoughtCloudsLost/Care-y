/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Followup_AddedInputs */

const en_audit_event_followup_added = /** @type {(inputs: Audit_Event_Followup_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Follow-up added`)
};

const es_audit_event_followup_added = /** @type {(inputs: Audit_Event_Followup_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seguimiento agregado`)
};

const en_xa2_audit_event_followup_added = /** @type {(inputs: Audit_Event_Followup_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòllòw-ùp àddèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Follow-up added" |
*
* @param {Audit_Event_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_followup_added = /** @type {((inputs?: Audit_Event_Followup_AddedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Followup_AddedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_followup_added(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_followup_added(inputs)
	return en_audit_event_followup_added(inputs)
});