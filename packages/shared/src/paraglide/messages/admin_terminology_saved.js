/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_SavedInputs */

const en_admin_terminology_saved = /** @type {(inputs: Admin_Terminology_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminology saved`)
};

const es_admin_terminology_saved = /** @type {(inputs: Admin_Terminology_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminología guardada`)
};

/**
* | output |
* | --- |
* | "Terminology saved" |
*
* @param {Admin_Terminology_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_saved = /** @type {((inputs?: Admin_Terminology_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_saved(inputs)
	return es_admin_terminology_saved(inputs)
});