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

const en_xa2_admin_templates_save_create = /** @type {(inputs: Admin_Templates_Save_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè tèmplàtè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Save template" |
*
* @param {Admin_Templates_Save_CreateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_save_create = /** @type {((inputs?: Admin_Templates_Save_CreateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Save_CreateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_save_create(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_save_create(inputs)
	return en_admin_templates_save_create(inputs)
});