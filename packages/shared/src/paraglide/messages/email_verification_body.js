/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ code: NonNullable<unknown> }} Email_Verification_BodyInputs */

const en_email_verification_body = /** @type {(inputs: Email_Verification_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Your verification code is: ${i?.code}. This code expires in 5 minutes. If you did not request this code, you can safely ignore this email.`)
};

const es_email_verification_body = /** @type {(inputs: Email_Verification_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tu código de verificación es: ${i?.code}. Este código expira en 5 minutos. Si no solicitaste este código, puedes ignorar este correo.`)
};

/**
* | output |
* | --- |
* | "Your verification code is: {code}. This code expires in 5 minutes. If you did not request this code, you can safely ignore this email." |
*
* @param {Email_Verification_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const email_verification_body = /** @type {((inputs: Email_Verification_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Email_Verification_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_email_verification_body(inputs)
	return es_email_verification_body(inputs)
});