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

const en_xa2_error_rate_limit_hourly = /** @type {(inputs: Error_Rate_Limit_HourlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tòò màny còdès rèqùèstèd. Plèàsè try àgàìn làtèr. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Too many codes requested. Please try again later." |
*
* @param {Error_Rate_Limit_HourlyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_rate_limit_hourly = /** @type {((inputs?: Error_Rate_Limit_HourlyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Rate_Limit_HourlyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_rate_limit_hourly(inputs)
	if (locale === "en-XA") return en_xa2_error_rate_limit_hourly(inputs)
	return en_error_rate_limit_hourly(inputs)
});