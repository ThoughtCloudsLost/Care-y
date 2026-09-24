/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Preview_State_FormInputs */

const en_intake_forms_preview_state_form = /** @type {(inputs: Intake_Forms_Preview_State_FormInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form`)
};

const es_intake_forms_preview_state_form = /** @type {(inputs: Intake_Forms_Preview_State_FormInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario`)
};

const en_xa2_intake_forms_preview_state_form = /** @type {(inputs: Intake_Forms_Preview_State_FormInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòrm ••⟧`)
};

/**
* | output |
* | --- |
* | "Form" |
*
* @param {Intake_Forms_Preview_State_FormInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview_state_form = /** @type {((inputs?: Intake_Forms_Preview_State_FormInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Preview_State_FormInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_preview_state_form(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_preview_state_form(inputs)
	return en_intake_forms_preview_state_form(inputs)
});