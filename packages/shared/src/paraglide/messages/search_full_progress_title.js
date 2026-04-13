/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Full_Progress_TitleInputs */

const en_search_full_progress_title = /** @type {(inputs: Search_Full_Progress_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Searching all...`)
};

const es_search_full_progress_title = /** @type {(inputs: Search_Full_Progress_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscando en todo...`)
};

/**
* | output |
* | --- |
* | "Searching all..." |
*
* @param {Search_Full_Progress_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_progress_title = /** @type {((inputs?: Search_Full_Progress_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_Progress_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_progress_title(inputs)
	return es_search_full_progress_title(inputs)
});