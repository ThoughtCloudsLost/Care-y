/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reseed_RetryInputs */

const en_reseed_retry = /** @type {(inputs: Reseed_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retry`)
};

const es_reseed_retry = /** @type {(inputs: Reseed_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reintentar`)
};

const en_xa2_reseed_retry = /** @type {(inputs: Reseed_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètry ••⟧`)
};

/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Reseed_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseed_retry = /** @type {((inputs?: Reseed_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reseed_retry(inputs)
	if (locale === "en-XA") return en_xa2_reseed_retry(inputs)
	return en_reseed_retry(inputs)
});