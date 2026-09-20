/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} App_RetryInputs */

const en_app_retry = /** @type {(inputs: App_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Try again`)
};

const es_app_retry = /** @type {(inputs: App_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intentar de nuevo`)
};

const en_xa2_app_retry = /** @type {(inputs: App_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Try àgàìn •••⟧`)
};

/**
* | output |
* | --- |
* | "Try again" |
*
* @param {App_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const app_retry = /** @type {((inputs?: App_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<App_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_app_retry(inputs)
	if (locale === "en-XA") return en_xa2_app_retry(inputs)
	return en_app_retry(inputs)
});