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

/**
* | output |
* | --- |
* | "Publish" |
*
* @param {Library_PublishInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_publish = /** @type {((inputs?: Library_PublishInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_PublishInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_publish(inputs)
	return es_library_publish(inputs)
});