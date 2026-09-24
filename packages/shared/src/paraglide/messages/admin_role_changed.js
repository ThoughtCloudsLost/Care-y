/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Role_ChangedInputs */

const en_admin_role_changed = /** @type {(inputs: Admin_Role_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role updated`)
};

const es_admin_role_changed = /** @type {(inputs: Admin_Role_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol actualizado`)
};

const en_xa2_admin_role_changed = /** @type {(inputs: Admin_Role_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròlè ùpdàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Role updated" |
*
* @param {Admin_Role_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_role_changed = /** @type {((inputs?: Admin_Role_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Role_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_role_changed(inputs)
	if (locale === "en-XA") return en_xa2_admin_role_changed(inputs)
	return en_admin_role_changed(inputs)
});