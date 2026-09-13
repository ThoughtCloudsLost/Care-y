/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Intake_Form_ClosedInputs */

const en_error_intake_form_closed = /** @type {(inputs: Error_Intake_Form_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This form is no longer accepting submissions.`)
};

const es_error_intake_form_closed = /** @type {(inputs: Error_Intake_Form_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este formulario ya no acepta envíos.`)
};

/**
* | output |
* | --- |
* | "This form is no longer accepting submissions." |
*
* @param {Error_Intake_Form_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_intake_form_closed = /** @type {((inputs?: Error_Intake_Form_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Intake_Form_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_intake_form_closed(inputs)
	return es_error_intake_form_closed(inputs)
});