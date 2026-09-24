/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Enroll_ChooseInputs */

const en_twofa_enroll_choose = /** @type {(inputs: Twofa_Enroll_ChooseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a verification method`)
};

const es_twofa_enroll_choose = /** @type {(inputs: Twofa_Enroll_ChooseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar un método de verificación`)
};

const en_xa2_twofa_enroll_choose = /** @type {(inputs: Twofa_Enroll_ChooseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd à vèrìfìcàtìòn mèthòd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add a verification method" |
*
* @param {Twofa_Enroll_ChooseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_enroll_choose = /** @type {((inputs?: Twofa_Enroll_ChooseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Enroll_ChooseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_enroll_choose(inputs)
	if (locale === "en-XA") return en_xa2_twofa_enroll_choose(inputs)
	return en_twofa_enroll_choose(inputs)
});