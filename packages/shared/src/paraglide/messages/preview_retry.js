/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Preview_RetryInputs */

const en_preview_retry = /** @type {(inputs: Preview_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retry`)
};

const es_preview_retry = /** @type {(inputs: Preview_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reintentar`)
};

const en_xa2_preview_retry = /** @type {(inputs: Preview_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètry ••⟧`)
};

/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Preview_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const preview_retry = /** @type {((inputs?: Preview_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Preview_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_preview_retry(inputs)
	if (locale === "en-XA") return en_xa2_preview_retry(inputs)
	return en_preview_retry(inputs)
});