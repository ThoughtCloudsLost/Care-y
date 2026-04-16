/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ text: NonNullable<unknown> }} Library_Editor_Link_Generic_WarningInputs */

const en_library_editor_link_generic_warning = /** @type {(inputs: Library_Editor_Link_Generic_WarningInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`"${i?.text}" is not descriptive for screen reader users. Use text that describes where the link goes.`)
};

const es_library_editor_link_generic_warning = /** @type {(inputs: Library_Editor_Link_Generic_WarningInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`"${i?.text}" no es descriptivo para usuarios de lectores de pantalla. Usa texto que describa a dónde lleva el enlace.`)
};

/**
* | output |
* | --- |
* | "\"{text}\" is not descriptive for screen reader users. Use text that describes where the link goes." |
*
* @param {Library_Editor_Link_Generic_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_generic_warning = /** @type {((inputs: Library_Editor_Link_Generic_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_Generic_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_link_generic_warning(inputs)
	return es_library_editor_link_generic_warning(inputs)
});