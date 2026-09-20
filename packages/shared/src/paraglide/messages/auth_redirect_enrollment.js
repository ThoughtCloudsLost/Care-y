/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Redirect_EnrollmentInputs */

const en_auth_redirect_enrollment = /** @type {(inputs: Auth_Redirect_EnrollmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Redirecting to account setup...`)
};

const es_auth_redirect_enrollment = /** @type {(inputs: Auth_Redirect_EnrollmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Redirigiendo a la configuración de cuenta...`)
};

const en_xa2_auth_redirect_enrollment = /** @type {(inputs: Auth_Redirect_EnrollmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèdìrèctìng tò àccòùnt sètùp... ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Redirecting to account setup..." |
*
* @param {Auth_Redirect_EnrollmentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_redirect_enrollment = /** @type {((inputs?: Auth_Redirect_EnrollmentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Redirect_EnrollmentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_redirect_enrollment(inputs)
	if (locale === "en-XA") return en_xa2_auth_redirect_enrollment(inputs)
	return en_auth_redirect_enrollment(inputs)
});