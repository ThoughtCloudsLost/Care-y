/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Lang_EsInputs */

const en_admin_terminology_lang_es = /** @type {(inputs: Admin_Terminology_Lang_EsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Spanish`)
};

const es_admin_terminology_lang_es = /** @type {(inputs: Admin_Terminology_Lang_EsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Español`)
};

/**
* | output |
* | --- |
* | "Spanish" |
*
* @param {Admin_Terminology_Lang_EsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_lang_es = /** @type {((inputs?: Admin_Terminology_Lang_EsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Lang_EsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_lang_es(inputs)
	return es_admin_terminology_lang_es(inputs)
});