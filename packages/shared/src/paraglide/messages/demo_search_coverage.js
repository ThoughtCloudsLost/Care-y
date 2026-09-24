/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_CoverageInputs */

const en_demo_search_coverage = /** @type {(inputs: Demo_Search_CoverageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coverage of decrypted tickets`)
};

const es_demo_search_coverage = /** @type {(inputs: Demo_Search_CoverageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cobertura de tickets descifrados`)
};

const en_xa2_demo_search_coverage = /** @type {(inputs: Demo_Search_CoverageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còvèràgè òf dècryptèd tìckèts •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Coverage of decrypted tickets" |
*
* @param {Demo_Search_CoverageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_search_coverage = /** @type {((inputs?: Demo_Search_CoverageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_CoverageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_search_coverage(inputs)
	if (locale === "en-XA") return en_xa2_demo_search_coverage(inputs)
	return en_demo_search_coverage(inputs)
});