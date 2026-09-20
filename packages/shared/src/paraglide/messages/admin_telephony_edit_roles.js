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

const en_xa2_admin_telephony_edit_roles = /** @type {(inputs: Admin_Telephony_Edit_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt ròlès •••⟧`)
};

/**
* | output |
* | --- |
* | "Edit roles" |
*
* @param {Admin_Telephony_Edit_RolesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_edit_roles = /** @type {((inputs?: Admin_Telephony_Edit_RolesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Edit_RolesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_edit_roles(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_edit_roles(inputs)
	return en_admin_telephony_edit_roles(inputs)
});