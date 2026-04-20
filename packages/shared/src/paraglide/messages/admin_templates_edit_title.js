/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Edit_TitleInputs */

const en_admin_templates_edit_title = /** @type {(inputs: Admin_Templates_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit template`)
};

const es_admin_templates_edit_title = /** @type {(inputs: Admin_Templates_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar plantilla`)
};

/**
* | output |
* | --- |
* | "Edit template" |
*
* @param {Admin_Templates_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_edit_title = /** @type {((inputs?: Admin_Templates_Edit_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Edit_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_edit_title(inputs)
	return es_admin_templates_edit_title(inputs)
});