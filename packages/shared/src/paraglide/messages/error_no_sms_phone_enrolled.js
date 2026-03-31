/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Sms_Phone_EnrolledInputs */

const en_error_no_sms_phone_enrolled = /** @type {(inputs: Error_No_Sms_Phone_EnrolledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No phone number enrolled. Set up SMS verification first.`)
};

const es_error_no_sms_phone_enrolled = /** @type {(inputs: Error_No_Sms_Phone_EnrolledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay número de teléfono registrado. Configura la verificación por SMS primero.`)
};

/**
* | output |
* | --- |
* | "No phone number enrolled. Set up SMS verification first." |
*
* @param {Error_No_Sms_Phone_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_sms_phone_enrolled = /** @type {((inputs?: Error_No_Sms_Phone_EnrolledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Sms_Phone_EnrolledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_no_sms_phone_enrolled(inputs)
	return es_error_no_sms_phone_enrolled(inputs)
});