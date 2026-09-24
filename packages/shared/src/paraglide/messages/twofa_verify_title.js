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

const en_xa2_twofa_verify_title = /** @type {(inputs: Twofa_Verify_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfy yòùr ìdèntìty ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Verify your identity" |
*
* @param {Twofa_Verify_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_verify_title = /** @type {((inputs?: Twofa_Verify_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Verify_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_verify_title(inputs)
	if (locale === "en-XA") return en_xa2_twofa_verify_title(inputs)
	return en_twofa_verify_title(inputs)
});