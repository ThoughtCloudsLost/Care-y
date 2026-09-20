/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Save_CreateInputs */

const en_admin_presets_save_create = /** @type {(inputs: Admin_Presets_Save_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save reply`)
};

const es_admin_presets_save_create = /** @type {(inputs: Admin_Presets_Save_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar respuesta`)
};

/**
* | output |
* | --- |
* | "Save reply" |
*
* @param {Admin_Presets_Save_CreateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_save_create = /** @type {((inputs?: Admin_Presets_Save_CreateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Save_CreateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_save_create(inputs)
	return en_admin_presets_save_create(inputs)
});