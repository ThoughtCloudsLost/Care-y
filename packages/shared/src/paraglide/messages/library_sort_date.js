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

const en_xa2_library_sort_date = /** @type {(inputs: Library_Sort_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtè crèàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Date created" |
*
* @param {Library_Sort_DateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_sort_date = /** @type {((inputs?: Library_Sort_DateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Sort_DateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_sort_date(inputs)
	if (locale === "en-XA") return en_xa2_library_sort_date(inputs)
	return en_library_sort_date(inputs)
});