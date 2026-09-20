/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Display_Name_LabelInputs */

const en_admin_display_name_label = /** @type {(inputs: Admin_Display_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Display Name`)
};

const es_admin_display_name_label = /** @type {(inputs: Admin_Display_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre visible`)
};

const en_xa2_admin_display_name_label = /** @type {(inputs: Admin_Display_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsplày Nàmè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Display Name" |
*
* @param {Admin_Display_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_display_name_label = /** @type {((inputs?: Admin_Display_Name_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Display_Name_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_display_name_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_display_name_label(inputs)
	return en_admin_display_name_label(inputs)
});