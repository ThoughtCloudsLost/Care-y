/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Intake_Responses_ExportedInputs */

const en_audit_event_intake_responses_exported = /** @type {(inputs: Audit_Event_Intake_Responses_ExportedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake responses exported as CSV`)
};

const es_audit_event_intake_responses_exported = /** @type {(inputs: Audit_Event_Intake_Responses_ExportedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas de admision exportadas como CSV`)
};

/**
* | output |
* | --- |
* | "Intake responses exported as CSV" |
*
* @param {Audit_Event_Intake_Responses_ExportedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_responses_exported = /** @type {((inputs?: Audit_Event_Intake_Responses_ExportedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Intake_Responses_ExportedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_intake_responses_exported(inputs)
	return es_audit_event_intake_responses_exported(inputs)
});