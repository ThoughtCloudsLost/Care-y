/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_Dialog_TitleInputs */

const en_admin_rotation_dialog_title = /** @type {(inputs: Admin_Rotation_Dialog_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotate organization key`)
};

const es_admin_rotation_dialog_title = /** @type {(inputs: Admin_Rotation_Dialog_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotar clave de la organización`)
};

const en_xa2_admin_rotation_dialog_title = /** @type {(inputs: Admin_Rotation_Dialog_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròtàtè òrgànìzàtìòn kèy •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Rotate organization key" |
*
* @param {Admin_Rotation_Dialog_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_title = /** @type {((inputs?: Admin_Rotation_Dialog_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Dialog_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_dialog_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_dialog_title(inputs)
	return en_admin_rotation_dialog_title(inputs)
});