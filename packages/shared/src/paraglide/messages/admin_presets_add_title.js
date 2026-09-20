/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Add_TitleInputs */

const en_admin_presets_add_title = /** @type {(inputs: Admin_Presets_Add_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Saved Reply`)
};

const es_admin_presets_add_title = /** @type {(inputs: Admin_Presets_Add_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nueva respuesta guardada`)
};

const en_xa2_admin_presets_add_title = /** @type {(inputs: Admin_Presets_Add_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw Sàvèd Rèply •••••⟧`)
};

/**
* | output |
* | --- |
* | "New Saved Reply" |
*
* @param {Admin_Presets_Add_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_add_title = /** @type {((inputs?: Admin_Presets_Add_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Add_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_add_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_add_title(inputs)
	return en_admin_presets_add_title(inputs)
});