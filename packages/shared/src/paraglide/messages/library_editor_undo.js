/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_UndoInputs */

const en_library_editor_undo = /** @type {(inputs: Library_Editor_UndoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Undo`)
};

const es_library_editor_undo = /** @type {(inputs: Library_Editor_UndoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deshacer`)
};

/**
* | output |
* | --- |
* | "Undo" |
*
* @param {Library_Editor_UndoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_undo = /** @type {((inputs?: Library_Editor_UndoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_UndoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_undo(inputs)
	return es_library_editor_undo(inputs)
});