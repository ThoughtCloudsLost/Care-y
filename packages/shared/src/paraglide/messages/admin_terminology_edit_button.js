/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Edit_ButtonInputs */

const en_admin_terminology_edit_button = /** @type {(inputs: Admin_Terminology_Edit_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Terms`)
};

const es_admin_terminology_edit_button = /** @type {(inputs: Admin_Terminology_Edit_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar términos`)
};

const en_xa2_admin_terminology_edit_button = /** @type {(inputs: Admin_Terminology_Edit_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt Tèrms •••⟧`)
};

/**
* | output |
* | --- |
* | "Edit Terms" |
*
* @param {Admin_Terminology_Edit_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_edit_button = /** @type {((inputs?: Admin_Terminology_Edit_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Edit_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_edit_button(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_edit_button(inputs)
	return en_admin_terminology_edit_button(inputs)
});