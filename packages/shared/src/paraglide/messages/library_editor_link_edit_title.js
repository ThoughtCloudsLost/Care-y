/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Link_Edit_TitleInputs */

const en_library_editor_link_edit_title = /** @type {(inputs: Library_Editor_Link_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Link`)
};

const es_library_editor_link_edit_title = /** @type {(inputs: Library_Editor_Link_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar enlace`)
};

/**
* | output |
* | --- |
* | "Edit Link" |
*
* @param {Library_Editor_Link_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_edit_title = /** @type {((inputs?: Library_Editor_Link_Edit_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_Edit_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_link_edit_title(inputs)
	return es_library_editor_link_edit_title(inputs)
});