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

const en_xa2_intake_forms_slug_error_length = /** @type {(inputs: Intake_Forms_Slug_Error_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Slùg mùst bè 2 tò 80 chàràctèrs. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Slug must be 2 to 80 characters." |
*
* @param {Intake_Forms_Slug_Error_LengthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_error_length = /** @type {((inputs?: Intake_Forms_Slug_Error_LengthInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Slug_Error_LengthInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_slug_error_length(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_slug_error_length(inputs)
	return en_intake_forms_slug_error_length(inputs)
});