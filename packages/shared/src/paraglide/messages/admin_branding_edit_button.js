/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Edit_ButtonInputs */

const en_admin_branding_edit_button = /** @type {(inputs: Admin_Branding_Edit_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit branding`)
};

const es_admin_branding_edit_button = /** @type {(inputs: Admin_Branding_Edit_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar marca`)
};

const en_xa2_admin_branding_edit_button = /** @type {(inputs: Admin_Branding_Edit_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt bràndìng ••••⟧`)
};

/**
* | output |
* | --- |
* | "Edit branding" |
*
* @param {Admin_Branding_Edit_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_edit_button = /** @type {((inputs?: Admin_Branding_Edit_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Edit_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_edit_button(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_edit_button(inputs)
	return en_admin_branding_edit_button(inputs)
});