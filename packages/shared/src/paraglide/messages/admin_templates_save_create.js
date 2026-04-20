/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Save_CreateInputs */

const en_admin_templates_save_create = /** @type {(inputs: Admin_Templates_Save_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save template`)
};

const es_admin_templates_save_create = /** @type {(inputs: Admin_Templates_Save_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar plantilla`)
};

/**
* | output |
* | --- |
* | "Save template" |
*
* @param {Admin_Templates_Save_CreateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_save_create = /** @type {((inputs?: Admin_Templates_Save_CreateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Save_CreateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_save_create(inputs)
	return es_admin_templates_save_create(inputs)
});