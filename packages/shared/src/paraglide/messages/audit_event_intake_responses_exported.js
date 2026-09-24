/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Intake_Responses_ExportedInputs */

const en_audit_event_intake_responses_exported = /** @type {(inputs: Audit_Event_Intake_Responses_ExportedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake responses exported as CSV`)
};

const es_audit_event_intake_responses_exported = /** @type {(inputs: Audit_Event_Intake_Responses_ExportedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas de admisión exportadas como CSV`)
};

const en_xa2_audit_event_intake_responses_exported = /** @type {(inputs: Audit_Event_Intake_Responses_ExportedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè rèspònsès èxpòrtèd às CSV ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake responses exported as CSV" |
*
* @param {Audit_Event_Intake_Responses_ExportedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_responses_exported = /** @type {((inputs?: Audit_Event_Intake_Responses_ExportedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Intake_Responses_ExportedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_intake_responses_exported(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_intake_responses_exported(inputs)
	return en_audit_event_intake_responses_exported(inputs)
});