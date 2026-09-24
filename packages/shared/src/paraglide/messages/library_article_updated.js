/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ time: NonNullable<unknown> }} Library_Article_UpdatedInputs */

const en_library_article_updated = /** @type {(inputs: Library_Article_UpdatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Updated ${i?.time}`)
};

const es_library_article_updated = /** @type {(inputs: Library_Article_UpdatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Actualizado ${i?.time}`)
};

const en_xa2_library_article_updated = /** @type {(inputs: Library_Article_UpdatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ùpdàtèd  •••${i?.time}⟧`)
};

/**
* | output |
* | --- |
* | "Updated {time}" |
*
* @param {Library_Article_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_article_updated = /** @type {((inputs: Library_Article_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_article_updated(inputs)
	if (locale === "en-XA") return en_xa2_library_article_updated(inputs)
	return en_library_article_updated(inputs)
});