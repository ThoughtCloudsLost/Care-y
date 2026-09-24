/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Link_Insert_TitleInputs */

const en_library_editor_link_insert_title = /** @type {(inputs: Library_Editor_Link_Insert_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Insert Link`)
};

const es_library_editor_link_insert_title = /** @type {(inputs: Library_Editor_Link_Insert_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Insertar enlace`)
};

const en_xa2_library_editor_link_insert_title = /** @type {(inputs: Library_Editor_Link_Insert_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnsèrt Lìnk ••••⟧`)
};

/**
* | output |
* | --- |
* | "Insert Link" |
*
* @param {Library_Editor_Link_Insert_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_insert_title = /** @type {((inputs?: Library_Editor_Link_Insert_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_Insert_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_link_insert_title(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_link_insert_title(inputs)
	return en_library_editor_link_insert_title(inputs)
});