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

const en_xa2_admin_templates_delete_title = /** @type {(inputs: Admin_Templates_Delete_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè tèmplàtè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete template" |
*
* @param {Admin_Templates_Delete_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_delete_title = /** @type {((inputs?: Admin_Templates_Delete_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Delete_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_delete_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_delete_title(inputs)
	return en_admin_templates_delete_title(inputs)
});