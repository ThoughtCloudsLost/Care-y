/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Rate_Limit_CooldownInputs */

const en_error_rate_limit_cooldown = /** @type {(inputs: Error_Rate_Limit_CooldownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please wait before requesting another code.`)
};

const es_error_rate_limit_cooldown = /** @type {(inputs: Error_Rate_Limit_CooldownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por favor, espera antes de solicitar otro código.`)
};

/**
* | output |
* | --- |
* | "Please wait before requesting another code." |
*
* @param {Error_Rate_Limit_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_rate_limit_cooldown = /** @type {((inputs?: Error_Rate_Limit_CooldownInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Rate_Limit_CooldownInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_rate_limit_cooldown(inputs)
	return es_error_rate_limit_cooldown(inputs)
});