/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ KnowledgeBase: NonNullable<unknown> }} Tab_LibraryInputs */

const en_tab_library = /** @type {(inputs: Tab_LibraryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.KnowledgeBase}`)
};

const es_tab_library = /** @type {(inputs: Tab_LibraryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.KnowledgeBase}`)
};

const en_xa2_tab_library = /** @type {(inputs: Tab_LibraryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.KnowledgeBase}⟧`)
};

/**
* | output |
* | --- |
* | "{KnowledgeBase}" |
*
* @param {Tab_LibraryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tab_library = /** @type {((inputs: Tab_LibraryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tab_LibraryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tab_library(inputs)
	if (locale === "en-XA") return en_xa2_tab_library(inputs)
	return en_tab_library(inputs)
});