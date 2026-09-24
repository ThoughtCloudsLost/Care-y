/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Attach_FileInputs */

const en_library_editor_attach_file = /** @type {(inputs: Library_Editor_Attach_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Attach file`)
};

const es_library_editor_attach_file = /** @type {(inputs: Library_Editor_Attach_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adjuntar archivo`)
};

const en_xa2_library_editor_attach_file = /** @type {(inputs: Library_Editor_Attach_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àttàch fìlè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Attach file" |
*
* @param {Library_Editor_Attach_FileInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_attach_file = /** @type {((inputs?: Library_Editor_Attach_FileInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Attach_FileInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_attach_file(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_attach_file(inputs)
	return en_library_editor_attach_file(inputs)
});