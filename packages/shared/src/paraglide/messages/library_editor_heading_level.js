/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ level: NonNullable<unknown> }} Library_Editor_Heading_LevelInputs */

const en_library_editor_heading_level = /** @type {(inputs: Library_Editor_Heading_LevelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Heading ${i?.level}`)
};

const es_library_editor_heading_level = /** @type {(inputs: Library_Editor_Heading_LevelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Encabezado ${i?.level}`)
};

const en_xa2_library_editor_heading_level = /** @type {(inputs: Library_Editor_Heading_LevelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Hèàdìng  •••${i?.level}⟧`)
};

/**
* | output |
* | --- |
* | "Heading {level}" |
*
* @param {Library_Editor_Heading_LevelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_heading_level = /** @type {((inputs: Library_Editor_Heading_LevelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Heading_LevelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_heading_level(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_heading_level(inputs)
	return en_library_editor_heading_level(inputs)
});