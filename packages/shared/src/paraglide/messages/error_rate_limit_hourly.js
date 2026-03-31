/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Rate_Limit_HourlyInputs */

const en_error_rate_limit_hourly = /** @type {(inputs: Error_Rate_Limit_HourlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too many codes requested. Please try again later.`)
};

const es_error_rate_limit_hourly = /** @type {(inputs: Error_Rate_Limit_HourlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demasiados códigos solicitados. Inténtalo más tarde.`)
};

/**
* | output |
* | --- |
* | "Too many codes requested. Please try again later." |
*
* @param {Error_Rate_Limit_HourlyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_rate_limit_hourly = /** @type {((inputs?: Error_Rate_Limit_HourlyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Rate_Limit_HourlyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_rate_limit_hourly(inputs)
	return es_error_rate_limit_hourly(inputs)
});