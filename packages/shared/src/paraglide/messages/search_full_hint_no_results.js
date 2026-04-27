/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Full_Hint_No_ResultsInputs */

const en_search_full_hint_no_results = /** @type {(inputs: Search_Full_Hint_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No matches in decrypted data. Tap to search encrypted items.`)
};

const es_search_full_hint_no_results = /** @type {(inputs: Search_Full_Hint_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin coincidencias en datos descifrados. Toca para buscar elementos cifrados.`)
};

/**
* | output |
* | --- |
* | "No matches in decrypted data. Tap to search encrypted items." |
*
* @param {Search_Full_Hint_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_hint_no_results = /** @type {((inputs?: Search_Full_Hint_No_ResultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_Hint_No_ResultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_hint_no_results(inputs)
	return es_search_full_hint_no_results(inputs)
});