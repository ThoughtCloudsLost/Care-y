/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_Dialog_TitleInputs */

const en_admin_rotation_dialog_title = /** @type {(inputs: Admin_Rotation_Dialog_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotate organization key`)
};

const es_admin_rotation_dialog_title = /** @type {(inputs: Admin_Rotation_Dialog_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotar clave de la organizacion`)
};

/**
* | output |
* | --- |
* | "Rotate organization key" |
*
* @param {Admin_Rotation_Dialog_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_title = /** @type {((inputs?: Admin_Rotation_Dialog_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Dialog_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_rotation_dialog_title(inputs)
	return es_admin_rotation_dialog_title(inputs)
});