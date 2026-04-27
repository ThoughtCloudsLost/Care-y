/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_Deep_Nav_LoadingInputs */

const en_search_deep_nav_loading = /** @type {(inputs: Search_Deep_Nav_LoadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Loading ${i?.count}...`)
};

const es_search_deep_nav_loading = /** @type {(inputs: Search_Deep_Nav_LoadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cargando ${i?.count}...`)
};

/**
* | output |
* | --- |
* | "Loading {count}..." |
*
* @param {Search_Deep_Nav_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_loading = /** @type {((inputs: Search_Deep_Nav_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Deep_Nav_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_deep_nav_loading(inputs)
	return es_search_deep_nav_loading(inputs)
});