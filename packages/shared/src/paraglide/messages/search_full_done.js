/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Full_DoneInputs */

const en_search_full_done = /** @type {(inputs: Search_Full_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`done`)
};

const es_search_full_done = /** @type {(inputs: Search_Full_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`listo`)
};

/**
* | output |
* | --- |
* | "done" |
*
* @param {Search_Full_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_done = /** @type {((inputs?: Search_Full_DoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_DoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_done(inputs)
	return es_search_full_done(inputs)
});