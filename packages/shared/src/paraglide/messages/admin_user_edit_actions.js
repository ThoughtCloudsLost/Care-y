/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_User_Edit_ActionsInputs */

const en_admin_user_edit_actions = /** @type {(inputs: Admin_User_Edit_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit user`)
};

const es_admin_user_edit_actions = /** @type {(inputs: Admin_User_Edit_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar usuario`)
};

const en_xa2_admin_user_edit_actions = /** @type {(inputs: Admin_User_Edit_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt ùsèr •••⟧`)
};

/**
* | output |
* | --- |
* | "Edit user" |
*
* @param {Admin_User_Edit_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_user_edit_actions = /** @type {((inputs?: Admin_User_Edit_ActionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_User_Edit_ActionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_user_edit_actions(inputs)
	if (locale === "en-XA") return en_xa2_admin_user_edit_actions(inputs)
	return en_admin_user_edit_actions(inputs)
});