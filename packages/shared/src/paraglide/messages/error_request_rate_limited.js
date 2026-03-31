/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Request_Rate_LimitedInputs */

const en_error_request_rate_limited = /** @type {(inputs: Error_Request_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too many requests. Try again later.`)
};

const es_error_request_rate_limited = /** @type {(inputs: Error_Request_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demasiadas solicitudes. Inténtalo más tarde.`)
};

/**
* | output |
* | --- |
* | "Too many requests. Try again later." |
*
* @param {Error_Request_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_request_rate_limited = /** @type {((inputs?: Error_Request_Rate_LimitedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Request_Rate_LimitedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_request_rate_limited(inputs)
	return es_error_request_rate_limited(inputs)
});