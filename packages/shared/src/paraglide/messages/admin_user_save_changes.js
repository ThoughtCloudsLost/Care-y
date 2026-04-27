/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_User_Save_ChangesInputs */

const en_admin_user_save_changes = /** @type {(inputs: Admin_User_Save_ChangesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save changes`)
};

const es_admin_user_save_changes = /** @type {(inputs: Admin_User_Save_ChangesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar cambios`)
};

/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_User_Save_ChangesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_user_save_changes = /** @type {((inputs?: Admin_User_Save_ChangesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_User_Save_ChangesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_user_save_changes(inputs)
	return es_admin_user_save_changes(inputs)
});