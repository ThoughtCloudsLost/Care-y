/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Error_Rate_LimitedInputs */

const en_consultant_phone_error_rate_limited = /** @type {(inputs: Consultant_Phone_Error_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too many codes sent. Try again later.`)
};

const es_consultant_phone_error_rate_limited = /** @type {(inputs: Consultant_Phone_Error_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demasiados codigos enviados. Intenta mas tarde.`)
};

/**
* | output |
* | --- |
* | "Too many codes sent. Try again later." |
*
* @param {Consultant_Phone_Error_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_error_rate_limited = /** @type {((inputs?: Consultant_Phone_Error_Rate_LimitedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Error_Rate_LimitedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_error_rate_limited(inputs)
	return es_consultant_phone_error_rate_limited(inputs)
});