/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Method_AddedInputs */

const en_twofa_method_added = /** @type {(inputs: Twofa_Method_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verification method added`)
};

const es_twofa_method_added = /** @type {(inputs: Twofa_Method_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Método de verificación agregado`)
};

/**
* | output |
* | --- |
* | "Verification method added" |
*
* @param {Twofa_Method_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_method_added = /** @type {((inputs?: Twofa_Method_AddedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Method_AddedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_method_added(inputs)
	return es_twofa_method_added(inputs)
});