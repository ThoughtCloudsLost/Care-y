/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Signing_InInputs */

const en_auth_signing_in = /** @type {(inputs: Auth_Signing_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Signing in...`)
};

const es_auth_signing_in = /** @type {(inputs: Auth_Signing_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iniciando sesión...`)
};

const en_xa2_auth_signing_in = /** @type {(inputs: Auth_Signing_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgnìng ìn... ••••⟧`)
};

/**
* | output |
* | --- |
* | "Signing in..." |
*
* @param {Auth_Signing_InInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_signing_in = /** @type {((inputs?: Auth_Signing_InInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Signing_InInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_signing_in(inputs)
	if (locale === "en-XA") return en_xa2_auth_signing_in(inputs)
	return en_auth_signing_in(inputs)
});