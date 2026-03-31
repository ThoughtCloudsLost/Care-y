/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Login_Rate_LimitedInputs */

const en_error_login_rate_limited = /** @type {(inputs: Error_Login_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too many login attempts. Try again later.`)
};

const es_error_login_rate_limited = /** @type {(inputs: Error_Login_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demasiados intentos de inicio de sesión. Inténtalo más tarde.`)
};

/**
* | output |
* | --- |
* | "Too many login attempts. Try again later." |
*
* @param {Error_Login_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_login_rate_limited = /** @type {((inputs?: Error_Login_Rate_LimitedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Login_Rate_LimitedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_login_rate_limited(inputs)
	return es_error_login_rate_limited(inputs)
});