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

/**
* | output |
* | --- |
* | "Export" |
*
* @param {Library_Action_ExportInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_action_export = /** @type {((inputs?: Library_Action_ExportInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Action_ExportInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_action_export(inputs)
	return es_library_action_export(inputs)
});