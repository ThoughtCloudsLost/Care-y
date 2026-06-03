/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_DescriptionInputs */

const en_admin_terminology_description = /** @type {(inputs: Admin_Terminology_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Customize the terms your organization uses throughout the app.`)
};

const es_admin_terminology_description = /** @type {(inputs: Admin_Terminology_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personalice los términos que su organización usa en la aplicación.`)
};

/**
* | output |
* | --- |
* | "Customize the terms your organization uses throughout the app." |
*
* @param {Admin_Terminology_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_description = /** @type {((inputs?: Admin_Terminology_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_description(inputs)
	return es_admin_terminology_description(inputs)
});