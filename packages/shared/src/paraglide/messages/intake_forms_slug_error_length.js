/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Slug_Error_LengthInputs */

const en_intake_forms_slug_error_length = /** @type {(inputs: Intake_Forms_Slug_Error_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Slug must be 2 to 80 characters.`)
};

const es_intake_forms_slug_error_length = /** @type {(inputs: Intake_Forms_Slug_Error_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El enlace debe tener entre 2 y 80 caracteres.`)
};

/**
* | output |
* | --- |
* | "Slug must be 2 to 80 characters." |
*
* @param {Intake_Forms_Slug_Error_LengthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_error_length = /** @type {((inputs?: Intake_Forms_Slug_Error_LengthInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Slug_Error_LengthInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_slug_error_length(inputs)
	return es_intake_forms_slug_error_length(inputs)
});