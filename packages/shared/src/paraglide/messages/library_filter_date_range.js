/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Filter_Date_RangeInputs */

const en_library_filter_date_range = /** @type {(inputs: Library_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date`)
};

const es_library_filter_date_range = /** @type {(inputs: Library_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha`)
};

/**
* | output |
* | --- |
* | "Date" |
*
* @param {Library_Filter_Date_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_date_range = /** @type {((inputs?: Library_Filter_Date_RangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_Date_RangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_filter_date_range(inputs)
	return es_library_filter_date_range(inputs)
});