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

const en_xa2_twofa_passkey_register = /** @type {(inputs: Twofa_Passkey_RegisterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Règìstèr pàsskèy •••••⟧`)
};

/**
* | output |
* | --- |
* | "Register passkey" |
*
* @param {Twofa_Passkey_RegisterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_register = /** @type {((inputs?: Twofa_Passkey_RegisterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Passkey_RegisterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_passkey_register(inputs)
	if (locale === "en-XA") return en_xa2_twofa_passkey_register(inputs)
	return en_twofa_passkey_register(inputs)
});