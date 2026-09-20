/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_View_ListInputs */

const en_library_view_list = /** @type {(inputs: Library_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`List view`)
};

const es_library_view_list = /** @type {(inputs: Library_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista de lista`)
};

const en_xa2_library_view_list = /** @type {(inputs: Library_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìst vìèw •••⟧`)
};

/**
* | output |
* | --- |
* | "List view" |
*
* @param {Library_View_ListInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_view_list = /** @type {((inputs?: Library_View_ListInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_View_ListInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_view_list(inputs)
	if (locale === "en-XA") return en_xa2_library_view_list(inputs)
	return en_library_view_list(inputs)
});