/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Email_Verification_SubjectInputs */

const en_email_verification_subject = /** @type {(inputs: Email_Verification_SubjectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your verification code`)
};

const es_email_verification_subject = /** @type {(inputs: Email_Verification_SubjectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu código de verificación`)
};

const en_xa2_email_verification_subject = /** @type {(inputs: Email_Verification_SubjectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr vèrìfìcàtìòn còdè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your verification code" |
*
* @param {Email_Verification_SubjectInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const email_verification_subject = /** @type {((inputs?: Email_Verification_SubjectInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Email_Verification_SubjectInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_email_verification_subject(inputs)
	if (locale === "en-XA") return en_xa2_email_verification_subject(inputs)
	return en_email_verification_subject(inputs)
});