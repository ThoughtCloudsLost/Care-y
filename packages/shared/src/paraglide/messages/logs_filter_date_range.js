/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Filter_Date_RangeInputs */

const en_logs_filter_date_range = /** @type {(inputs: Logs_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date range`)
};

const es_logs_filter_date_range = /** @type {(inputs: Logs_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rango de fechas`)
};

/**
* | output |
* | --- |
* | "Date range" |
*
* @param {Logs_Filter_Date_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_filter_date_range = /** @type {((inputs?: Logs_Filter_Date_RangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Filter_Date_RangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_filter_date_range(inputs)
	return es_logs_filter_date_range(inputs)
});