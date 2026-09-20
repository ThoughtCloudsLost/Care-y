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

const en_xa2_twofa_method_added = /** @type {(inputs: Twofa_Method_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfìcàtìòn mèthòd àddèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Verification method added" |
*
* @param {Twofa_Method_AddedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_method_added = /** @type {((inputs?: Twofa_Method_AddedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Method_AddedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_method_added(inputs)
	if (locale === "en-XA") return en_xa2_twofa_method_added(inputs)
	return en_twofa_method_added(inputs)
});