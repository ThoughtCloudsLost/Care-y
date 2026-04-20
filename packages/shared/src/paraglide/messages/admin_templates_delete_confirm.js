/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Delete_ConfirmInputs */

const en_admin_templates_delete_confirm = /** @type {(inputs: Admin_Templates_Delete_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Are you sure you want to remove this template?`)
};

const es_admin_templates_delete_confirm = /** @type {(inputs: Admin_Templates_Delete_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estas seguro de que deseas eliminar esta plantilla?`)
};

/**
* | output |
* | --- |
* | "Are you sure you want to remove this template?" |
*
* @param {Admin_Templates_Delete_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_delete_confirm = /** @type {((inputs?: Admin_Templates_Delete_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Delete_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_delete_confirm(inputs)
	return es_admin_templates_delete_confirm(inputs)
});