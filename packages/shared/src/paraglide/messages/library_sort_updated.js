/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Sort_UpdatedInputs */

const en_library_sort_updated = /** @type {(inputs: Library_Sort_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Last updated`)
};

const es_library_sort_updated = /** @type {(inputs: Library_Sort_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Última actualización`)
};

const en_xa2_library_sort_updated = /** @type {(inputs: Library_Sort_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Làst ùpdàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Last updated" |
*
* @param {Library_Sort_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_sort_updated = /** @type {((inputs?: Library_Sort_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Sort_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_sort_updated(inputs)
	if (locale === "en-XA") return en_xa2_library_sort_updated(inputs)
	return en_library_sort_updated(inputs)
});