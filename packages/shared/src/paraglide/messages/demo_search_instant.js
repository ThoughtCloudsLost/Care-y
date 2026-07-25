/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_InstantInputs */

const en_demo_search_instant = /** @type {(inputs: Demo_Search_InstantInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Showing instant results`)
};

const es_demo_search_instant = /** @type {(inputs: Demo_Search_InstantInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrando resultados instantaneos`)
};

/**
* | output |
* | --- |
* | "Showing instant results" |
*
* @param {Demo_Search_InstantInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_instant = /** @type {((inputs?: Demo_Search_InstantInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_InstantInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_search_instant(inputs)
	return es_demo_search_instant(inputs)
});