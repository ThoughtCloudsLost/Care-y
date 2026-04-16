/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Disabled_A11yInputs */

const en_library_editor_disabled_a11y = /** @type {(inputs: Library_Editor_Disabled_A11yInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close the accessibility check to edit`)
};

const es_library_editor_disabled_a11y = /** @type {(inputs: Library_Editor_Disabled_A11yInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cierra la revisión de accesibilidad para editar`)
};

/**
* | output |
* | --- |
* | "Close the accessibility check to edit" |
*
* @param {Library_Editor_Disabled_A11yInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_disabled_a11y = /** @type {((inputs?: Library_Editor_Disabled_A11yInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Disabled_A11yInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_disabled_a11y(inputs)
	return es_library_editor_disabled_a11y(inputs)
});