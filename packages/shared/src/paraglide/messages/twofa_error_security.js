/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_SecurityInputs */

const en_twofa_error_security = /** @type {(inputs: Twofa_Error_SecurityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This site is not recognized by your authenticator.`)
};

const es_twofa_error_security = /** @type {(inputs: Twofa_Error_SecurityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este sitio no es reconocido por tu autenticador.`)
};

const en_xa2_twofa_error_security = /** @type {(inputs: Twofa_Error_SecurityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs sìtè ìs nòt rècògnìzèd by yòùr àùthèntìcàtòr. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This site is not recognized by your authenticator." |
*
* @param {Twofa_Error_SecurityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_security = /** @type {((inputs?: Twofa_Error_SecurityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_SecurityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_error_security(inputs)
	if (locale === "en-XA") return en_xa2_twofa_error_security(inputs)
	return en_twofa_error_security(inputs)
});