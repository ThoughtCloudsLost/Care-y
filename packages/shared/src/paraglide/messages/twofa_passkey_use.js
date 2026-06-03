/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Passkey_UseInputs */

const en_twofa_passkey_use = /** @type {(inputs: Twofa_Passkey_UseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use passkey`)
};

const es_twofa_passkey_use = /** @type {(inputs: Twofa_Passkey_UseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usar clave de acceso`)
};

/**
* | output |
* | --- |
* | "Use passkey" |
*
* @param {Twofa_Passkey_UseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_use = /** @type {((inputs?: Twofa_Passkey_UseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Passkey_UseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_passkey_use(inputs)
	return es_twofa_passkey_use(inputs)
});