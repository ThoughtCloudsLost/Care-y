/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Recents_ClearInputs */

const en_search_recents_clear = /** @type {(inputs: Search_Recents_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear`)
};

const es_search_recents_clear = /** @type {(inputs: Search_Recents_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Borrar`)
};

const en_xa2_search_recents_clear = /** @type {(inputs: Search_Recents_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clèàr ••⟧`)
};

/**
* | output |
* | --- |
* | "Clear" |
*
* @param {Search_Recents_ClearInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_recents_clear = /** @type {((inputs?: Search_Recents_ClearInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Recents_ClearInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_recents_clear(inputs)
	if (locale === "en-XA") return en_xa2_search_recents_clear(inputs)
	return en_search_recents_clear(inputs)
});