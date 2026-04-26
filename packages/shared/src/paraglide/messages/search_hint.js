/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_HintInputs */

const en_search_hint = /** @type {(inputs: Search_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search loaded tickets and articles`)
};

const es_search_hint = /** @type {(inputs: Search_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar tickets y articulos cargados`)
};

/**
* | output |
* | --- |
* | "Search loaded tickets and articles" |
*
* @param {Search_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_hint = /** @type {((inputs?: Search_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_hint(inputs)
	return es_search_hint(inputs)
});