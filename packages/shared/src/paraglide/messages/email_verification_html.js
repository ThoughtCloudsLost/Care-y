/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ code: NonNullable<unknown> }} Email_Verification_HtmlInputs */

const en_email_verification_html = /** @type {(inputs: Email_Verification_HtmlInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`<p>Your verification code is: <strong>${i?.code}</strong></p><p>This code expires in 5 minutes. If you did not request this code, you can safely ignore this email.</p>`)
};

const es_email_verification_html = /** @type {(inputs: Email_Verification_HtmlInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`<p>Tu código de verificación es: <strong>${i?.code}</strong></p><p>Este código expira en 5 minutos. Si no solicitaste este código, puedes ignorar este correo.</p>`)
};

const en_xa2_email_verification_html = /** @type {(inputs: Email_Verification_HtmlInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦<p>Yòùr vèrìfìcàtìòn còdè ìs: <stròng> ••••••••••••${i?.code}</stròng></p><p>Thìs còdè èxpìrès ìn 5 mìnùtès. Ìf yòù dìd nòt rèqùèst thìs còdè, yòù càn sàfèly ìgnòrè thìs èmàìl.</p> ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "<p>Your verification code is: <strong>{code}</strong></p><p>This code expires in 5 minutes. If you did not request this code, you can safely ignore this emai..." |
*
* @param {Email_Verification_HtmlInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const email_verification_html = /** @type {((inputs: Email_Verification_HtmlInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Email_Verification_HtmlInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_email_verification_html(inputs)
	if (locale === "en-XA") return en_xa2_email_verification_html(inputs)
	return en_email_verification_html(inputs)
});