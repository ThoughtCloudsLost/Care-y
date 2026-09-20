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

const en_xa2_library_editor_undo = /** @type {(inputs: Library_Editor_UndoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùndò ••⟧`)
};

/**
* | output |
* | --- |
* | "Undo" |
*
* @param {Library_Editor_UndoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_undo = /** @type {((inputs?: Library_Editor_UndoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_UndoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_undo(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_undo(inputs)
	return en_library_editor_undo(inputs)
});