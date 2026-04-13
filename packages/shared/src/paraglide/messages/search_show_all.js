/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_Show_AllInputs */

const en_search_show_all = /** @type {(inputs: Search_Show_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Show all (${i?.count})`)
};

const es_search_show_all = /** @type {(inputs: Search_Show_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ver todos (${i?.count})`)
};

/**
* | output |
* | --- |
* | "Show all ({count})" |
*
* @param {Search_Show_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_show_all = /** @type {((inputs: Search_Show_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Show_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_show_all(inputs)
	return es_search_show_all(inputs)
});