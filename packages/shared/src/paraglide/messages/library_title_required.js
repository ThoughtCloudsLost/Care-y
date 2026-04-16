/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Title_RequiredInputs */

const en_library_title_required = /** @type {(inputs: Library_Title_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title is required`)
};

const es_library_title_required = /** @type {(inputs: Library_Title_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El título es obligatorio`)
};

/**
* | output |
* | --- |
* | "Title is required" |
*
* @param {Library_Title_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_title_required = /** @type {((inputs?: Library_Title_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Title_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_title_required(inputs)
	return es_library_title_required(inputs)
});