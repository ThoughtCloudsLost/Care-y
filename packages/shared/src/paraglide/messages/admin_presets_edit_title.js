/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Edit_TitleInputs */

const en_admin_presets_edit_title = /** @type {(inputs: Admin_Presets_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Saved Reply`)
};

const es_admin_presets_edit_title = /** @type {(inputs: Admin_Presets_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar respuesta guardada`)
};

/**
* | output |
* | --- |
* | "Edit Saved Reply" |
*
* @param {Admin_Presets_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_edit_title = /** @type {((inputs?: Admin_Presets_Edit_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Edit_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_edit_title(inputs)
	return en_admin_presets_edit_title(inputs)
});