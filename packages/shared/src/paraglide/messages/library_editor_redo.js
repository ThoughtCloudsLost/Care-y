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

const en_xa2_library_editor_redo = /** @type {(inputs: Library_Editor_RedoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèdò ••⟧`)
};

/**
* | output |
* | --- |
* | "Redo" |
*
* @param {Library_Editor_RedoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_redo = /** @type {((inputs?: Library_Editor_RedoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_RedoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_redo(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_redo(inputs)
	return en_library_editor_redo(inputs)
});