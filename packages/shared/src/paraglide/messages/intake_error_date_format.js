/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Date_FormatInputs */

const en_intake_error_date_format = /** @type {(inputs: Intake_Error_Date_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a valid date.`)
};

const es_intake_error_date_format = /** @type {(inputs: Intake_Error_Date_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingrese una fecha valida.`)
};

/**
* | output |
* | --- |
* | "Enter a valid date." |
*
* @param {Intake_Error_Date_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_date_format = /** @type {((inputs?: Intake_Error_Date_FormatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Date_FormatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_date_format(inputs)
	return es_intake_error_date_format(inputs)
});