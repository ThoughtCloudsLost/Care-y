/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Phone_FormatInputs */

const en_intake_error_phone_format = /** @type {(inputs: Intake_Error_Phone_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a phone number like +1 555 000 1234.`)
};

const es_intake_error_phone_format = /** @type {(inputs: Intake_Error_Phone_FormatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa un numero de telefono como +1 555 000 1234.`)
};

/**
* | output |
* | --- |
* | "Enter a phone number like +1 555 000 1234." |
*
* @param {Intake_Error_Phone_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_phone_format = /** @type {((inputs?: Intake_Error_Phone_FormatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Phone_FormatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_phone_format(inputs)
	return es_intake_error_phone_format(inputs)
});