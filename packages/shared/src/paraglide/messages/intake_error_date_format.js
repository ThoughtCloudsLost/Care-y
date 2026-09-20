/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Date_FormatInputs */

const en_intake_error_date_format = /** @type {(inputs: Intake_Error_Date_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a valid date.`)
};

const es_intake_error_date_format = /** @type {(inputs: Intake_Error_Date_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingrese una fecha válida.`)
};

const en_xa2_intake_error_date_format = /** @type {(inputs: Intake_Error_Date_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr à vàlìd dàtè. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter a valid date." |
*
* @param {Intake_Error_Date_FormatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_date_format = /** @type {((inputs?: Intake_Error_Date_FormatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Date_FormatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_error_date_format(inputs)
	if (locale === "en-XA") return en_xa2_intake_error_date_format(inputs)
	return en_intake_error_date_format(inputs)
});