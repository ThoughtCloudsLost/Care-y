/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Intake_Form_DeletedInputs */

const en_audit_event_intake_form_deleted = /** @type {(inputs: Audit_Event_Intake_Form_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake form deleted`)
};

const es_audit_event_intake_form_deleted = /** @type {(inputs: Audit_Event_Intake_Form_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario de admisión eliminado`)
};

const en_xa2_audit_event_intake_form_deleted = /** @type {(inputs: Audit_Event_Intake_Form_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè fòrm dèlètèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake form deleted" |
*
* @param {Audit_Event_Intake_Form_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_form_deleted = /** @type {((inputs?: Audit_Event_Intake_Form_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Intake_Form_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_intake_form_deleted(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_intake_form_deleted(inputs)
	return en_audit_event_intake_form_deleted(inputs)
});