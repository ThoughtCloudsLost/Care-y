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

const en_xa2_admin_display_name_updated = /** @type {(inputs: Admin_Display_Name_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsplày nàmè ùpdàtèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Display name updated" |
*
* @param {Admin_Display_Name_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_display_name_updated = /** @type {((inputs?: Admin_Display_Name_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Display_Name_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_display_name_updated(inputs)
	if (locale === "en-XA") return en_xa2_admin_display_name_updated(inputs)
	return en_admin_display_name_updated(inputs)
});