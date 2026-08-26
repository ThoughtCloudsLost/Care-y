/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Intake_Responses_ViewedInputs */

const en_audit_event_intake_responses_viewed = /** @type {(inputs: Audit_Event_Intake_Responses_ViewedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake responses viewed`)
};

const es_audit_event_intake_responses_viewed = /** @type {(inputs: Audit_Event_Intake_Responses_ViewedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas de admision consultadas`)
};

/**
* | output |
* | --- |
* | "Intake responses viewed" |
*
* @param {Audit_Event_Intake_Responses_ViewedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_responses_viewed = /** @type {((inputs?: Audit_Event_Intake_Responses_ViewedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Intake_Responses_ViewedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_intake_responses_viewed(inputs)
	return es_audit_event_intake_responses_viewed(inputs)
});