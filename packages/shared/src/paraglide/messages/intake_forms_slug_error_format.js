/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Slug_Error_FormatInputs */

const en_intake_forms_slug_error_format = /** @type {(inputs: Intake_Forms_Slug_Error_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lowercase letters, digits, and single hyphens only. Must start and end with a letter or digit.`)
};

const es_intake_forms_slug_error_format = /** @type {(inputs: Intake_Forms_Slug_Error_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo letras minúsculas, dígitos y guiones simples. Debe comenzar y terminar con una letra o digito.`)
};

const en_xa2_intake_forms_slug_error_format = /** @type {(inputs: Intake_Forms_Slug_Error_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòwèrcàsè lèttèrs, dìgìts, ànd sìnglè hyphèns ònly. Mùst stàrt ànd ènd wìth à lèttèr òr dìgìt. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Lowercase letters, digits, and single hyphens only. Must start and end with a letter or digit." |
*
* @param {Intake_Forms_Slug_Error_FormatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_error_format = /** @type {((inputs?: Intake_Forms_Slug_Error_FormatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Slug_Error_FormatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_slug_error_format(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_slug_error_format(inputs)
	return en_intake_forms_slug_error_format(inputs)
});