/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Bootstrap_Rate_LimitedInputs */

const en_error_bootstrap_rate_limited = /** @type {(inputs: Error_Bootstrap_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too many setup attempts. Try again later.`)
};

const es_error_bootstrap_rate_limited = /** @type {(inputs: Error_Bootstrap_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demasiados intentos de configuración. Inténtalo más tarde.`)
};

const en_xa2_error_bootstrap_rate_limited = /** @type {(inputs: Error_Bootstrap_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tòò màny sètùp àttèmpts. Try àgàìn làtèr. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Too many setup attempts. Try again later." |
*
* @param {Error_Bootstrap_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_bootstrap_rate_limited = /** @type {((inputs?: Error_Bootstrap_Rate_LimitedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Bootstrap_Rate_LimitedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_bootstrap_rate_limited(inputs)
	if (locale === "en-XA") return en_xa2_error_bootstrap_rate_limited(inputs)
	return en_error_bootstrap_rate_limited(inputs)
});