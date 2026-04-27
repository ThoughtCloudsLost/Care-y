/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Sheet_TitleInputs */

const en_admin_branding_sheet_title = /** @type {(inputs: Admin_Branding_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Branding`)
};

const es_admin_branding_sheet_title = /** @type {(inputs: Admin_Branding_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar marca`)
};

/**
* | output |
* | --- |
* | "Edit Branding" |
*
* @param {Admin_Branding_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_sheet_title = /** @type {((inputs?: Admin_Branding_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_sheet_title(inputs)
	return es_admin_branding_sheet_title(inputs)
});