/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Intake_Form_BoundInputs */

const en_audit_event_intake_form_bound = /** @type {(inputs: Audit_Event_Intake_Form_BoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake form binding changed`)
};

const es_audit_event_intake_form_bound = /** @type {(inputs: Audit_Event_Intake_Form_BoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignación del formulario de admisión cambiada`)
};

const en_xa2_audit_event_intake_form_bound = /** @type {(inputs: Audit_Event_Intake_Form_BoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè fòrm bìndìng chàngèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake form binding changed" |
*
* @param {Audit_Event_Intake_Form_BoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_form_bound = /** @type {((inputs?: Audit_Event_Intake_Form_BoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Intake_Form_BoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_intake_form_bound(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_intake_form_bound(inputs)
	return en_audit_event_intake_form_bound(inputs)
});