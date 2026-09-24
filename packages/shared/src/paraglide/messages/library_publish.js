/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_PublishInputs */

const en_library_publish = /** @type {(inputs: Library_PublishInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Publish`)
};

const es_library_publish = /** @type {(inputs: Library_PublishInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Publicar`)
};

const en_xa2_library_publish = /** @type {(inputs: Library_PublishInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pùblìsh •••⟧`)
};

/**
* | output |
* | --- |
* | "Publish" |
*
* @param {Library_PublishInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_publish = /** @type {((inputs?: Library_PublishInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_PublishInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_publish(inputs)
	if (locale === "en-XA") return en_xa2_library_publish(inputs)
	return en_library_publish(inputs)
});