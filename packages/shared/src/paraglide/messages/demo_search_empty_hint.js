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

const en_xa2_demo_search_empty_hint = /** @type {(inputs: Demo_Search_Empty_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Typè tò sèàrch... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Type to search..." |
*
* @param {Demo_Search_Empty_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_search_empty_hint = /** @type {((inputs?: Demo_Search_Empty_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_Empty_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_search_empty_hint(inputs)
	if (locale === "en-XA") return en_xa2_demo_search_empty_hint(inputs)
	return en_demo_search_empty_hint(inputs)
});