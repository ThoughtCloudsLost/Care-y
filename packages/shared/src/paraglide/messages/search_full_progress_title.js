/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Full_Progress_TitleInputs */

const en_search_full_progress_title = /** @type {(inputs: Search_Full_Progress_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlocking and searching...`)
};

const es_search_full_progress_title = /** @type {(inputs: Search_Full_Progress_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloqueando y buscando...`)
};

const en_xa2_search_full_progress_title = /** @type {(inputs: Search_Full_Progress_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnlòckìng ànd sèàrchìng... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unlocking and searching..." |
*
* @param {Search_Full_Progress_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_full_progress_title = /** @type {((inputs?: Search_Full_Progress_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_Progress_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_full_progress_title(inputs)
	if (locale === "en-XA") return en_xa2_search_full_progress_title(inputs)
	return en_search_full_progress_title(inputs)
});