/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Totp_Not_EnrolledInputs */

const en_error_totp_not_enrolled = /** @type {(inputs: Error_Totp_Not_EnrolledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Authenticator app is not set up.`)
};

const es_error_totp_not_enrolled = /** @type {(inputs: Error_Totp_Not_EnrolledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La aplicación de autenticación no está configurada.`)
};

/**
* | output |
* | --- |
* | "Authenticator app is not set up." |
*
* @param {Error_Totp_Not_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_totp_not_enrolled = /** @type {((inputs?: Error_Totp_Not_EnrolledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Totp_Not_EnrolledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_totp_not_enrolled(inputs)
	return es_error_totp_not_enrolled(inputs)
});