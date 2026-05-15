/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Email_ResendInputs */

const en_twofa_email_resend = /** @type {(inputs: Twofa_Email_ResendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resend code`)
};

const es_twofa_email_resend = /** @type {(inputs: Twofa_Email_ResendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reenviar código`)
};

/**
* | output |
* | --- |
* | "Resend code" |
*
* @param {Twofa_Email_ResendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_resend = /** @type {((inputs?: Twofa_Email_ResendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_ResendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_email_resend(inputs)
	return es_twofa_email_resend(inputs)
});