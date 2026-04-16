/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_RedoInputs */

const en_library_editor_redo = /** @type {(inputs: Library_Editor_RedoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Redo`)
};

const es_library_editor_redo = /** @type {(inputs: Library_Editor_RedoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rehacer`)
};

/**
* | output |
* | --- |
* | "Redo" |
*
* @param {Library_Editor_RedoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_redo = /** @type {((inputs?: Library_Editor_RedoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_RedoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_redo(inputs)
	return es_library_editor_redo(inputs)
});