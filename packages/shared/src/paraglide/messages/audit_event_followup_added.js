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

/**
* | output |
* | --- |
* | "Follow-up added" |
*
* @param {Audit_Event_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_followup_added = /** @type {((inputs?: Audit_Event_Followup_AddedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Followup_AddedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_followup_added(inputs)
	return es_audit_event_followup_added(inputs)
});