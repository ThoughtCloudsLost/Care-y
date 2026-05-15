/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Verify_TitleInputs */

const en_twofa_verify_title = /** @type {(inputs: Twofa_Verify_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify your identity`)
};

const es_twofa_verify_title = /** @type {(inputs: Twofa_Verify_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifica tu identidad`)
};

/**
* | output |
* | --- |
* | "Verify your identity" |
*
* @param {Twofa_Verify_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_verify_title = /** @type {((inputs?: Twofa_Verify_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Verify_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_verify_title(inputs)
	return es_twofa_verify_title(inputs)
});