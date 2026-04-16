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

/**
* | output |
* | --- |
* | "Bullet list" |
*
* @param {Library_Editor_Bullet_ListInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_bullet_list = /** @type {((inputs?: Library_Editor_Bullet_ListInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Bullet_ListInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_bullet_list(inputs)
	return es_library_editor_bullet_list(inputs)
});