/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Delete_TitleInputs */

const en_admin_templates_delete_title = /** @type {(inputs: Admin_Templates_Delete_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete template`)
};

const es_admin_templates_delete_title = /** @type {(inputs: Admin_Templates_Delete_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar plantilla`)
};

/**
* | output |
* | --- |
* | "Delete template" |
*
* @param {Admin_Templates_Delete_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_delete_title = /** @type {((inputs?: Admin_Templates_Delete_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Delete_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_delete_title(inputs)
	return es_admin_templates_delete_title(inputs)
});