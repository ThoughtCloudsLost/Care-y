/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Enroll_TitleInputs */

const en_twofa_enroll_title = /** @type {(inputs: Twofa_Enroll_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two-factor authentication`)
};

const es_twofa_enroll_title = /** @type {(inputs: Twofa_Enroll_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autenticación de dos factores`)
};

/**
* | output |
* | --- |
* | "Two-factor authentication" |
*
* @param {Twofa_Enroll_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_enroll_title = /** @type {((inputs?: Twofa_Enroll_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Enroll_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_enroll_title(inputs)
	return es_twofa_enroll_title(inputs)
});