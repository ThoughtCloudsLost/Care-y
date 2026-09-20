/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Delete_TitleInputs */

const en_admin_presets_delete_title = /** @type {(inputs: Admin_Presets_Delete_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete saved reply`)
};

const es_admin_presets_delete_title = /** @type {(inputs: Admin_Presets_Delete_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar respuesta guardada`)
};

/**
* | output |
* | --- |
* | "Delete saved reply" |
*
* @param {Admin_Presets_Delete_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_delete_title = /** @type {((inputs?: Admin_Presets_Delete_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Delete_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_delete_title(inputs)
	return en_admin_presets_delete_title(inputs)
});