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

/**
* | output |
* | --- |
* | "Signing in..." |
*
* @param {Auth_Signing_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_signing_in = /** @type {((inputs?: Auth_Signing_InInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Signing_InInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_signing_in(inputs)
	return es_auth_signing_in(inputs)
});