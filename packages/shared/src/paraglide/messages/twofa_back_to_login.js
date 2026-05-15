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

/**
* | output |
* | --- |
* | "Back to login" |
*
* @param {Twofa_Back_To_LoginInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_back_to_login = /** @type {((inputs?: Twofa_Back_To_LoginInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Back_To_LoginInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_back_to_login(inputs)
	return es_twofa_back_to_login(inputs)
});