/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Email_FormatInputs */

const en_intake_error_email_format = /** @type {(inputs: Intake_Error_Email_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a valid email address.`)
};

const es_intake_error_email_format = /** @type {(inputs: Intake_Error_Email_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa un correo electronico valido.`)
};

/**
* | output |
* | --- |
* | "Enter a valid email address." |
*
* @param {Intake_Error_Email_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_email_format = /** @type {((inputs?: Intake_Error_Email_FormatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Email_FormatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_email_format(inputs)
	return es_intake_error_email_format(inputs)
});