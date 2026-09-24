/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Intake_Form_SavedInputs */

const en_audit_event_intake_form_saved = /** @type {(inputs: Audit_Event_Intake_Form_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake form saved`)
};

const es_audit_event_intake_form_saved = /** @type {(inputs: Audit_Event_Intake_Form_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario de admisión guardado`)
};

const en_xa2_audit_event_intake_form_saved = /** @type {(inputs: Audit_Event_Intake_Form_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè fòrm sàvèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake form saved" |
*
* @param {Audit_Event_Intake_Form_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_form_saved = /** @type {((inputs?: Audit_Event_Intake_Form_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Intake_Form_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_intake_form_saved(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_intake_form_saved(inputs)
	return en_audit_event_intake_form_saved(inputs)
});