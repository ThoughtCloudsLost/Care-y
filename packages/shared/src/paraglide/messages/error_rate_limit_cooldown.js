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

const en_xa2_error_rate_limit_cooldown = /** @type {(inputs: Error_Rate_Limit_CooldownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plèàsè wàìt bèfòrè rèqùèstìng ànòthèr còdè. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Please wait before requesting another code." |
*
* @param {Error_Rate_Limit_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_rate_limit_cooldown = /** @type {((inputs?: Error_Rate_Limit_CooldownInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Rate_Limit_CooldownInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_rate_limit_cooldown(inputs)
	if (locale === "en-XA") return en_xa2_error_rate_limit_cooldown(inputs)
	return en_error_rate_limit_cooldown(inputs)
});