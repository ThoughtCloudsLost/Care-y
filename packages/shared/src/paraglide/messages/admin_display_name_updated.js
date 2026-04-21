/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Display_Name_UpdatedInputs */

const en_admin_display_name_updated = /** @type {(inputs: Admin_Display_Name_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Display name updated`)
};

const es_admin_display_name_updated = /** @type {(inputs: Admin_Display_Name_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre visible actualizado`)
};

/**
* | output |
* | --- |
* | "Display name updated" |
*
* @param {Admin_Display_Name_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_display_name_updated = /** @type {((inputs?: Admin_Display_Name_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Display_Name_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_display_name_updated(inputs)
	return es_admin_display_name_updated(inputs)
});