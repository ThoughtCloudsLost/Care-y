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

const en_xa2_library_publishing = /** @type {(inputs: Library_PublishingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pùblìshìng... ••••⟧`)
};

/**
* | output |
* | --- |
* | "Publishing..." |
*
* @param {Library_PublishingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_publishing = /** @type {((inputs?: Library_PublishingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_PublishingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_publishing(inputs)
	if (locale === "en-XA") return en_xa2_library_publishing(inputs)
	return en_library_publishing(inputs)
});