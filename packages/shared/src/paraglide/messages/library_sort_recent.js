/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Sort_RecentInputs */

const en_library_sort_recent = /** @type {(inputs: Library_Sort_RecentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recently updated`)
};

const es_library_sort_recent = /** @type {(inputs: Library_Sort_RecentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actualizados recientemente`)
};

/**
* | output |
* | --- |
* | "Recently updated" |
*
* @param {Library_Sort_RecentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort_recent = /** @type {((inputs?: Library_Sort_RecentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Sort_RecentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_sort_recent(inputs)
	return es_library_sort_recent(inputs)
});