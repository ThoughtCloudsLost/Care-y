/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Sort_DateInputs */

const en_library_sort_date = /** @type {(inputs: Library_Sort_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date created`)
};

const es_library_sort_date = /** @type {(inputs: Library_Sort_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha de creación`)
};

/**
* | output |
* | --- |
* | "Date created" |
*
* @param {Library_Sort_DateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort_date = /** @type {((inputs?: Library_Sort_DateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Sort_DateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_sort_date(inputs)
	return es_library_sort_date(inputs)
});