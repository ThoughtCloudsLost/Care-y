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

const en_xa2_admin_terminology_error = /** @type {(inputs: Admin_Terminology_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fàìlèd tò sàvè tèrmìnòlògy ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Failed to save terminology" |
*
* @param {Admin_Terminology_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_error = /** @type {((inputs?: Admin_Terminology_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_error(inputs)
	return en_admin_terminology_error(inputs)
});