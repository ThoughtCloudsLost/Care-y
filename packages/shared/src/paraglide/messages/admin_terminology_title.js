/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_TitleInputs */

const en_admin_terminology_title = /** @type {(inputs: Admin_Terminology_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminology`)
};

const es_admin_terminology_title = /** @type {(inputs: Admin_Terminology_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminología`)
};

/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Admin_Terminology_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_title = /** @type {((inputs?: Admin_Terminology_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_title(inputs)
	return es_admin_terminology_title(inputs)
});