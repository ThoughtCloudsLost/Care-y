/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Full_Hint_No_DataInputs */

const en_search_full_hint_no_data = /** @type {(inputs: Search_Full_Hint_No_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No data loaded yet. Tap to search encrypted items.`)
};

const es_search_full_hint_no_data = /** @type {(inputs: Search_Full_Hint_No_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aun no se han cargado datos. Toca para buscar elementos cifrados.`)
};

/**
* | output |
* | --- |
* | "No data loaded yet. Tap to search encrypted items." |
*
* @param {Search_Full_Hint_No_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_hint_no_data = /** @type {((inputs?: Search_Full_Hint_No_DataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_Hint_No_DataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_hint_no_data(inputs)
	return es_search_full_hint_no_data(inputs)
});