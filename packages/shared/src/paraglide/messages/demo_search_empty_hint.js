/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_Empty_HintInputs */

const en_demo_search_empty_hint = /** @type {(inputs: Demo_Search_Empty_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type to search...`)
};

const es_demo_search_empty_hint = /** @type {(inputs: Demo_Search_Empty_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe para buscar...`)
};

/**
* | output |
* | --- |
* | "Type to search..." |
*
* @param {Demo_Search_Empty_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_empty_hint = /** @type {((inputs?: Demo_Search_Empty_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_Empty_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_search_empty_hint(inputs)
	return es_demo_search_empty_hint(inputs)
});