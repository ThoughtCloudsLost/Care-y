/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Edit_RolesInputs */

const en_admin_telephony_edit_roles = /** @type {(inputs: Admin_Telephony_Edit_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit roles`)
};

const es_admin_telephony_edit_roles = /** @type {(inputs: Admin_Telephony_Edit_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar roles`)
};

/**
* | output |
* | --- |
* | "Edit roles" |
*
* @param {Admin_Telephony_Edit_RolesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_edit_roles = /** @type {((inputs?: Admin_Telephony_Edit_RolesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Edit_RolesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_edit_roles(inputs)
	return es_admin_telephony_edit_roles(inputs)
});