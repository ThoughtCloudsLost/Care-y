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

const en_xa2_twofa_email_desc = /** @type {(inputs: Twofa_Email_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wè sènd à 6-dìgìt còdè tò yòùr èmàìl èàch tìmè yòù lòg ìn. Cònvènìènt, bùt ònly às sècùrè às yòùr èmàìl àccòùnt. Ànyònè whò càn rèàd yòùr èmàìl càn rècèìvè thèsè còdès. •••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "We send a 6-digit code to your email each time you log in. Convenient, but only as secure as your email account. Anyone who can read your email can receive t..." |
*
* @param {Twofa_Email_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_email_desc = /** @type {((inputs?: Twofa_Email_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_email_desc(inputs)
	if (locale === "en-XA") return en_xa2_twofa_email_desc(inputs)
	return en_twofa_email_desc(inputs)
});