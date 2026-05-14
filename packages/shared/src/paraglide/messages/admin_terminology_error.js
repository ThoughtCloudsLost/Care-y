/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_ErrorInputs */

const en_admin_terminology_error = /** @type {(inputs: Admin_Terminology_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to save terminology`)
};

const es_admin_terminology_error = /** @type {(inputs: Admin_Terminology_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al guardar la terminología`)
};

/**
* | output |
* | --- |
* | "Failed to save terminology" |
*
* @param {Admin_Terminology_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_error = /** @type {((inputs?: Admin_Terminology_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_error(inputs)
	return es_admin_terminology_error(inputs)
});