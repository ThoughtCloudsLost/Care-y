/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Verify_Method_PickerInputs */

const en_twofa_verify_method_picker = /** @type {(inputs: Twofa_Verify_Method_PickerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a verification method`)
};

const es_twofa_verify_method_picker = /** @type {(inputs: Twofa_Verify_Method_PickerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elige un método de verificación`)
};

const en_xa2_twofa_verify_method_picker = /** @type {(inputs: Twofa_Verify_Method_PickerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chòòsè à vèrìfìcàtìòn mèthòd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choose a verification method" |
*
* @param {Twofa_Verify_Method_PickerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_verify_method_picker = /** @type {((inputs?: Twofa_Verify_Method_PickerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Verify_Method_PickerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_verify_method_picker(inputs)
	if (locale === "en-XA") return en_xa2_twofa_verify_method_picker(inputs)
	return en_twofa_verify_method_picker(inputs)
});