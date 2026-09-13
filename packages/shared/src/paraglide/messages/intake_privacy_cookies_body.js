/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Cookies_BodyInputs */

const en_intake_privacy_cookies_body = /** @type {(inputs: Intake_Privacy_Cookies_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This site uses only session and security cookies that are needed for the form to work. These cookies do not track you and do not require your consent.`)
};

const es_intake_privacy_cookies_body = /** @type {(inputs: Intake_Privacy_Cookies_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este sitio solo usa cookies de sesion y seguridad necesarias para que el formulario funcione. Estas cookies no te rastrean y no requieren tu consentimiento.`)
};

/**
* | output |
* | --- |
* | "This site uses only session and security cookies that are needed for the form to work. These cookies do not track you and do not require your consent." |
*
* @param {Intake_Privacy_Cookies_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_cookies_body = /** @type {((inputs?: Intake_Privacy_Cookies_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Cookies_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_cookies_body(inputs)
	return es_intake_privacy_cookies_body(inputs)
});