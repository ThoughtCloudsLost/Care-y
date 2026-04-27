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

/**
* | output |
* | --- |
* | "Change role" |
*
* @param {Admin_Role_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_role_change = /** @type {((inputs?: Admin_Role_ChangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Role_ChangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_role_change(inputs)
	return es_admin_role_change(inputs)
});