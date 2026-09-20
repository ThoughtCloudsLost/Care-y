/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_RetryInputs */

const en_common_retry = /** @type {(inputs: Common_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retry`)
};

const es_common_retry = /** @type {(inputs: Common_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reintentar`)
};

const en_xa2_common_retry = /** @type {(inputs: Common_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètry ••⟧`)
};

/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Common_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_retry = /** @type {((inputs?: Common_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_common_retry(inputs)
	if (locale === "en-XA") return en_xa2_common_retry(inputs)
	return en_common_retry(inputs)
});