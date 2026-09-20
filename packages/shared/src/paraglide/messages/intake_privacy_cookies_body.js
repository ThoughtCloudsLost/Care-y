/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Cookies_BodyInputs */

const en_intake_privacy_cookies_body = /** @type {(inputs: Intake_Privacy_Cookies_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This site uses only session and security cookies that are needed for the form to work. These cookies do not track you and do not require your consent.`)
};

const es_intake_privacy_cookies_body = /** @type {(inputs: Intake_Privacy_Cookies_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este sitio solo usa cookies de sesión y seguridad necesarias para que el formulario funcione. Estas cookies no te rastrean y no requieren tu consentimiento.`)
};

const en_xa2_intake_privacy_cookies_body = /** @type {(inputs: Intake_Privacy_Cookies_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs sìtè ùsès ònly sèssìòn ànd sècùrìty còòkìès thàt àrè nèèdèd fòr thè fòrm tò wòrk. Thèsè còòkìès dò nòt tràck yòù ànd dò nòt rèqùìrè yòùr cònsènt. •••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This site uses only session and security cookies that are needed for the form to work. These cookies do not track you and do not require your consent." |
*
* @param {Intake_Privacy_Cookies_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_cookies_body = /** @type {((inputs?: Intake_Privacy_Cookies_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Cookies_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_cookies_body(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_cookies_body(inputs)
	return en_intake_privacy_cookies_body(inputs)
});