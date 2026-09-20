/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Lang_EnInputs */

const en_admin_terminology_lang_en = /** @type {(inputs: Admin_Terminology_Lang_EnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`English`)
};

const es_admin_terminology_lang_en = /** @type {(inputs: Admin_Terminology_Lang_EnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inglés`)
};

const en_xa2_admin_terminology_lang_en = /** @type {(inputs: Admin_Terminology_Lang_EnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ènglìsh •••⟧`)
};

/**
* | output |
* | --- |
* | "English" |
*
* @param {Admin_Terminology_Lang_EnInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_lang_en = /** @type {((inputs?: Admin_Terminology_Lang_EnInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Lang_EnInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_lang_en(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_lang_en(inputs)
	return en_admin_terminology_lang_en(inputs)
});