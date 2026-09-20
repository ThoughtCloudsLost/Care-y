/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Add_ButtonInputs */

const en_admin_presets_add_button = /** @type {(inputs: Admin_Presets_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add reply`)
};

const es_admin_presets_add_button = /** @type {(inputs: Admin_Presets_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar respuesta`)
};

/**
* | output |
* | --- |
* | "Add reply" |
*
* @param {Admin_Presets_Add_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_add_button = /** @type {((inputs?: Admin_Presets_Add_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Add_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_add_button(inputs)
	return en_admin_presets_add_button(inputs)
});