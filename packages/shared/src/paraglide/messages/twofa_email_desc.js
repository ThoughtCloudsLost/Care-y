/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Email_DescInputs */

const en_twofa_email_desc = /** @type {(inputs: Twofa_Email_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We send a 6-digit code to your email each time you log in. Convenient, but only as secure as your email account. Anyone who can read your email can receive these codes.`)
};

const es_twofa_email_desc = /** @type {(inputs: Twofa_Email_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviamos un código de 6 dígitos a tu correo cada vez que inicias sesión. Es conveniente, pero solo tan seguro como tu cuenta de correo. Cualquier persona que pueda leer tu correo puede recibir estos códigos.`)
};

/**
* | output |
* | --- |
* | "We send a 6-digit code to your email each time you log in. Convenient, but only as secure as your email account. Anyone who can read your email can receive t..." |
*
* @param {Twofa_Email_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_desc = /** @type {((inputs?: Twofa_Email_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_email_desc(inputs)
	return es_twofa_email_desc(inputs)
});