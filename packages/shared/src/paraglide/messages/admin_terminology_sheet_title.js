/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Sheet_TitleInputs */

const en_admin_terminology_sheet_title = /** @type {(inputs: Admin_Terminology_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Terminology`)
};

const es_admin_terminology_sheet_title = /** @type {(inputs: Admin_Terminology_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar terminología`)
};

/**
* | output |
* | --- |
* | "Edit Terminology" |
*
* @param {Admin_Terminology_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_sheet_title = /** @type {((inputs?: Admin_Terminology_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_sheet_title(inputs)
	return es_admin_terminology_sheet_title(inputs)
});