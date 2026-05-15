/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Passkey_RegisterInputs */

const en_twofa_passkey_register = /** @type {(inputs: Twofa_Passkey_RegisterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Register passkey`)
};

const es_twofa_passkey_register = /** @type {(inputs: Twofa_Passkey_RegisterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registrar clave de acceso`)
};

/**
* | output |
* | --- |
* | "Register passkey" |
*
* @param {Twofa_Passkey_RegisterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_register = /** @type {((inputs?: Twofa_Passkey_RegisterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Passkey_RegisterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_passkey_register(inputs)
	return es_twofa_passkey_register(inputs)
});