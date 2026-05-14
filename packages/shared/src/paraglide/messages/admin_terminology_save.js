/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_SaveInputs */

const en_admin_terminology_save = /** @type {(inputs: Admin_Terminology_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save`)
};

const es_admin_terminology_save = /** @type {(inputs: Admin_Terminology_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar`)
};

/**
* | output |
* | --- |
* | "Save" |
*
* @param {Admin_Terminology_SaveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_save = /** @type {((inputs?: Admin_Terminology_SaveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_SaveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_save(inputs)
	return es_admin_terminology_save(inputs)
});