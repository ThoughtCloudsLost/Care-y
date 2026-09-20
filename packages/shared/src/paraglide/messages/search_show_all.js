/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Show_AllInputs */

const en_search_show_all = /** @type {(inputs: Search_Show_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show all`)
};

const es_search_show_all = /** @type {(inputs: Search_Show_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver todos`)
};

const en_xa2_search_show_all = /** @type {(inputs: Search_Show_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shòw àll •••⟧`)
};

/**
* | output |
* | --- |
* | "Show all" |
*
* @param {Search_Show_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_show_all = /** @type {((inputs?: Search_Show_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Show_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_show_all(inputs)
	if (locale === "en-XA") return en_xa2_search_show_all(inputs)
	return en_search_show_all(inputs)
});