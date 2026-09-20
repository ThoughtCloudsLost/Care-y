/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Bullet_ListInputs */

const en_library_editor_bullet_list = /** @type {(inputs: Library_Editor_Bullet_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bullet list`)
};

const es_library_editor_bullet_list = /** @type {(inputs: Library_Editor_Bullet_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista con viñetas`)
};

const en_xa2_library_editor_bullet_list = /** @type {(inputs: Library_Editor_Bullet_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bùllèt lìst ••••⟧`)
};

/**
* | output |
* | --- |
* | "Bullet list" |
*
* @param {Library_Editor_Bullet_ListInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_bullet_list = /** @type {((inputs?: Library_Editor_Bullet_ListInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Bullet_ListInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_bullet_list(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_bullet_list(inputs)
	return en_library_editor_bullet_list(inputs)
});