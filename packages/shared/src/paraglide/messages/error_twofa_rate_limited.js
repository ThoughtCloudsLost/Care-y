/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Twofa_Rate_LimitedInputs */

const en_error_twofa_rate_limited = /** @type {(inputs: Error_Twofa_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too many attempts. Wait a few minutes, then try again.`)
};

const es_error_twofa_rate_limited = /** @type {(inputs: Error_Twofa_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demasiados intentos. Espera unos minutos y vuelve a intentarlo.`)
};

const en_xa2_error_twofa_rate_limited = /** @type {(inputs: Error_Twofa_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tòò màny àttèmpts. Wàìt à fèw mìnùtès, thèn try àgàìn. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Too many attempts. Wait a few minutes, then try again." |
*
* @param {Error_Twofa_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_twofa_rate_limited = /** @type {((inputs?: Error_Twofa_Rate_LimitedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Twofa_Rate_LimitedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_twofa_rate_limited(inputs)
	if (locale === "en-XA") return en_xa2_error_twofa_rate_limited(inputs)
	return en_error_twofa_rate_limited(inputs)
});