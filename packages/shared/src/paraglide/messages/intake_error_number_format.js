/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Number_FormatInputs */

const en_intake_error_number_format = /** @type {(inputs: Intake_Error_Number_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a valid number.`)
};

const es_intake_error_number_format = /** @type {(inputs: Intake_Error_Number_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingrese un número válido.`)
};

const en_xa2_intake_error_number_format = /** @type {(inputs: Intake_Error_Number_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr à vàlìd nùmbèr. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter a valid number." |
*
* @param {Intake_Error_Number_FormatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_number_format = /** @type {((inputs?: Intake_Error_Number_FormatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Number_FormatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_error_number_format(inputs)
	if (locale === "en-XA") return en_xa2_intake_error_number_format(inputs)
	return en_intake_error_number_format(inputs)
});