/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Action_ExportInputs */

const en_library_action_export = /** @type {(inputs: Library_Action_ExportInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export`)
};

const es_library_action_export = /** @type {(inputs: Library_Action_ExportInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exportar`)
};

const en_xa2_library_action_export = /** @type {(inputs: Library_Action_ExportInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpòrt ••⟧`)
};

/**
* | output |
* | --- |
* | "Export" |
*
* @param {Library_Action_ExportInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_action_export = /** @type {((inputs?: Library_Action_ExportInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Action_ExportInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_action_export(inputs)
	if (locale === "en-XA") return en_xa2_library_action_export(inputs)
	return en_library_action_export(inputs)
});