/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ action: NonNullable<unknown> }} Library_Editor_Disabled_HereInputs */

const en_library_editor_disabled_here = /** @type {(inputs: Library_Editor_Disabled_HereInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Move your cursor to a regular paragraph to use ${i?.action}.`)
};

const es_library_editor_disabled_here = /** @type {(inputs: Library_Editor_Disabled_HereInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mueve el cursor a un párrafo normal para usar ${i?.action}.`)
};

/**
* | output |
* | --- |
* | "Move your cursor to a regular paragraph to use {action}." |
*
* @param {Library_Editor_Disabled_HereInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_disabled_here = /** @type {((inputs: Library_Editor_Disabled_HereInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Disabled_HereInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_disabled_here(inputs)
	return es_library_editor_disabled_here(inputs)
});