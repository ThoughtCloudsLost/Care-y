/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Was_HelpfulInputs */

const en_library_was_helpful = /** @type {(inputs: Library_Was_HelpfulInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Was this helpful?`)
};

const es_library_was_helpful = /** @type {(inputs: Library_Was_HelpfulInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Te resultó útil?`)
};

const en_xa2_library_was_helpful = /** @type {(inputs: Library_Was_HelpfulInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wàs thìs hèlpfùl? ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Was this helpful?" |
*
* @param {Library_Was_HelpfulInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_was_helpful = /** @type {((inputs?: Library_Was_HelpfulInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Was_HelpfulInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_was_helpful(inputs)
	if (locale === "en-XA") return en_xa2_library_was_helpful(inputs)
	return en_library_was_helpful(inputs)
});