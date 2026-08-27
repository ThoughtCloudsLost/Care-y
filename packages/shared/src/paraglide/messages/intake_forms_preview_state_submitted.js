/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Preview_State_SubmittedInputs */

const en_intake_forms_preview_state_submitted = /** @type {(inputs: Intake_Forms_Preview_State_SubmittedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Submitted`)
};

const es_intake_forms_preview_state_submitted = /** @type {(inputs: Intake_Forms_Preview_State_SubmittedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviado`)
};

/**
* | output |
* | --- |
* | "Submitted" |
*
* @param {Intake_Forms_Preview_State_SubmittedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview_state_submitted = /** @type {((inputs?: Intake_Forms_Preview_State_SubmittedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Preview_State_SubmittedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_preview_state_submitted(inputs)
	return es_intake_forms_preview_state_submitted(inputs)
});