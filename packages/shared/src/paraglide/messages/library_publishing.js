/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_PublishingInputs */

const en_library_publishing = /** @type {(inputs: Library_PublishingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Publishing...`)
};

const es_library_publishing = /** @type {(inputs: Library_PublishingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Publicando...`)
};

/**
* | output |
* | --- |
* | "Publishing..." |
*
* @param {Library_PublishingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_publishing = /** @type {((inputs?: Library_PublishingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_PublishingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_publishing(inputs)
	return es_library_publishing(inputs)
});