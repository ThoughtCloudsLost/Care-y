/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_DecorativeInputs */

const en_library_editor_decorative = /** @type {(inputs: Library_Editor_DecorativeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decorative (no description needed)`)
};

const es_library_editor_decorative = /** @type {(inputs: Library_Editor_DecorativeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decorativa (sin descripción necesaria)`)
};

const en_xa2_library_editor_decorative = /** @type {(inputs: Library_Editor_DecorativeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dècòràtìvè (nò dèscrìptìòn nèèdèd) •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Decorative (no description needed)" |
*
* @param {Library_Editor_DecorativeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_decorative = /** @type {((inputs?: Library_Editor_DecorativeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_DecorativeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_decorative(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_decorative(inputs)
	return en_library_editor_decorative(inputs)
});