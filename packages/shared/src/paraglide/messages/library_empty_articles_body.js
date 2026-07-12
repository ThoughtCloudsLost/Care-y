/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Empty_Articles_BodyInputs */

const en_library_empty_articles_body = /** @type {(inputs: Library_Empty_Articles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When your team writes an article, it shows up here.`)
};

const es_library_empty_articles_body = /** @type {(inputs: Library_Empty_Articles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando tu equipo escriba un artículo, aparecerá aquí.`)
};

/**
* | output |
* | --- |
* | "When your team writes an article, it shows up here." |
*
* @param {Library_Empty_Articles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_empty_articles_body = /** @type {((inputs?: Library_Empty_Articles_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Empty_Articles_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_empty_articles_body(inputs)
	return es_library_empty_articles_body(inputs)
});