/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Intake_Form_SavedInputs */

const en_audit_event_intake_form_saved = /** @type {(inputs: Audit_Event_Intake_Form_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake form saved`)
};

const es_audit_event_intake_form_saved = /** @type {(inputs: Audit_Event_Intake_Form_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario de admision guardado`)
};

/**
* | output |
* | --- |
* | "Intake form saved" |
*
* @param {Audit_Event_Intake_Form_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_form_saved = /** @type {((inputs?: Audit_Event_Intake_Form_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Intake_Form_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_intake_form_saved(inputs)
	return es_audit_event_intake_form_saved(inputs)
});