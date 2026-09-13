/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Intake_Form_BoundInputs */

const en_audit_event_intake_form_bound = /** @type {(inputs: Audit_Event_Intake_Form_BoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake form binding changed`)
};

const es_audit_event_intake_form_bound = /** @type {(inputs: Audit_Event_Intake_Form_BoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignacion del formulario de admision cambiada`)
};

/**
* | output |
* | --- |
* | "Intake form binding changed" |
*
* @param {Audit_Event_Intake_Form_BoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_form_bound = /** @type {((inputs?: Audit_Event_Intake_Form_BoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Intake_Form_BoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_intake_form_bound(inputs)
	return es_audit_event_intake_form_bound(inputs)
});