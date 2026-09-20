/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Role_ChangeInputs */

const en_admin_role_change = /** @type {(inputs: Admin_Role_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change role`)
};

const es_admin_role_change = /** @type {(inputs: Admin_Role_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar rol`)
};

const en_xa2_admin_role_change = /** @type {(inputs: Admin_Role_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngè ròlè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Change role" |
*
* @param {Admin_Role_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_role_change = /** @type {((inputs?: Admin_Role_ChangeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Role_ChangeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_role_change(inputs)
	if (locale === "en-XA") return en_xa2_admin_role_change(inputs)
	return en_admin_role_change(inputs)
});