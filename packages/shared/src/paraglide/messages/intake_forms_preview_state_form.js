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

/**
* | output |
* | --- |
* | "Form" |
*
* @param {Intake_Forms_Preview_State_FormInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview_state_form = /** @type {((inputs?: Intake_Forms_Preview_State_FormInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Preview_State_FormInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_preview_state_form(inputs)
	return es_intake_forms_preview_state_form(inputs)
});