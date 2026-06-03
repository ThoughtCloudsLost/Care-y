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

/**
* | output |
* | --- |
* | "Edit Terms" |
*
* @param {Admin_Terminology_Edit_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_edit_button = /** @type {((inputs?: Admin_Terminology_Edit_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Edit_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_edit_button(inputs)
	return es_admin_terminology_edit_button(inputs)
});