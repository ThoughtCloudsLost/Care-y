/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Enroll_TitleInputs */

const en_twofa_enroll_title = /** @type {(inputs: Twofa_Enroll_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two factor authentication`)
};

const es_twofa_enroll_title = /** @type {(inputs: Twofa_Enroll_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autenticación de dos factores`)
};

const en_xa2_twofa_enroll_title = /** @type {(inputs: Twofa_Enroll_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Twò fàctòr àùthèntìcàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Two factor authentication" |
*
* @param {Twofa_Enroll_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_enroll_title = /** @type {((inputs?: Twofa_Enroll_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Enroll_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_enroll_title(inputs)
	if (locale === "en-XA") return en_xa2_twofa_enroll_title(inputs)
	return en_twofa_enroll_title(inputs)
});