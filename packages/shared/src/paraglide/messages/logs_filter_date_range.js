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

const en_xa2_logs_filter_date_range = /** @type {(inputs: Logs_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtè ràngè •••⟧`)
};

/**
* | output |
* | --- |
* | "Date range" |
*
* @param {Logs_Filter_Date_RangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_filter_date_range = /** @type {((inputs?: Logs_Filter_Date_RangeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Filter_Date_RangeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_filter_date_range(inputs)
	if (locale === "en-XA") return en_xa2_logs_filter_date_range(inputs)
	return en_logs_filter_date_range(inputs)
});