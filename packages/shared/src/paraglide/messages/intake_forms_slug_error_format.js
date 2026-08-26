/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Slug_Error_FormatInputs */

const en_intake_forms_slug_error_format = /** @type {(inputs: Intake_Forms_Slug_Error_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lowercase letters, digits, and single hyphens only. Must start and end with a letter or digit.`)
};

const es_intake_forms_slug_error_format = /** @type {(inputs: Intake_Forms_Slug_Error_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo letras minusculas, digitos y guiones simples. Debe comenzar y terminar con una letra o digito.`)
};

/**
* | output |
* | --- |
* | "Lowercase letters, digits, and single hyphens only. Must start and end with a letter or digit." |
*
* @param {Intake_Forms_Slug_Error_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_error_format = /** @type {((inputs?: Intake_Forms_Slug_Error_FormatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Slug_Error_FormatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_slug_error_format(inputs)
	return es_intake_forms_slug_error_format(inputs)
});