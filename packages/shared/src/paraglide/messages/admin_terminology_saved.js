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

const en_xa2_admin_terminology_saved = /** @type {(inputs: Admin_Terminology_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèrmìnòlògy sàvèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Terminology saved" |
*
* @param {Admin_Terminology_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_saved = /** @type {((inputs?: Admin_Terminology_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_saved(inputs)
	return en_admin_terminology_saved(inputs)
});