/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Back_To_LoginInputs */

const en_twofa_back_to_login = /** @type {(inputs: Twofa_Back_To_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back to login`)
};

const es_twofa_back_to_login = /** @type {(inputs: Twofa_Back_To_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volver al inicio de sesión`)
};

const en_xa2_twofa_back_to_login = /** @type {(inputs: Twofa_Back_To_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàck tò lògìn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Back to login" |
*
* @param {Twofa_Back_To_LoginInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_back_to_login = /** @type {((inputs?: Twofa_Back_To_LoginInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Back_To_LoginInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_back_to_login(inputs)
	if (locale === "en-XA") return en_xa2_twofa_back_to_login(inputs)
	return en_twofa_back_to_login(inputs)
});