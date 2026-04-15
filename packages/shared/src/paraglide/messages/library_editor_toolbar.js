/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_ToolbarInputs */

const en_library_editor_toolbar = /** @type {(inputs: Library_Editor_ToolbarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editor toolbar`)
};

const es_library_editor_toolbar = /** @type {(inputs: Library_Editor_ToolbarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Barra de herramientas del editor`)
};

/**
* | output |
* | --- |
* | "Editor toolbar" |
*
* @param {Library_Editor_ToolbarInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_toolbar = /** @type {((inputs?: Library_Editor_ToolbarInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_ToolbarInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_toolbar(inputs)
	return es_library_editor_toolbar(inputs)
});