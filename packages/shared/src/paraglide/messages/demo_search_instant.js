/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_InstantInputs */

const en_demo_search_instant = /** @type {(inputs: Demo_Search_InstantInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Showing instant results`)
};

const es_demo_search_instant = /** @type {(inputs: Demo_Search_InstantInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrando resultados instantáneos`)
};

const en_xa2_demo_search_instant = /** @type {(inputs: Demo_Search_InstantInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shòwìng ìnstànt rèsùlts •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Showing instant results" |
*
* @param {Demo_Search_InstantInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_search_instant = /** @type {((inputs?: Demo_Search_InstantInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_InstantInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_search_instant(inputs)
	if (locale === "en-XA") return en_xa2_demo_search_instant(inputs)
	return en_demo_search_instant(inputs)
});