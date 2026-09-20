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

const en_xa2_library_editor_disabled_a11y = /** @type {(inputs: Library_Editor_Disabled_A11yInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsè thè àccèssìbìlìty chèck tò èdìt ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Close the accessibility check to edit" |
*
* @param {Library_Editor_Disabled_A11yInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_disabled_a11y = /** @type {((inputs?: Library_Editor_Disabled_A11yInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Disabled_A11yInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_disabled_a11y(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_disabled_a11y(inputs)
	return en_library_editor_disabled_a11y(inputs)
});