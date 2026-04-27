/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Role_UnknownInputs */

const en_admin_role_unknown = /** @type {(inputs: Admin_Role_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unknown role`)
};

const es_admin_role_unknown = /** @type {(inputs: Admin_Role_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol desconocido`)
};

/**
* | output |
* | --- |
* | "Unknown role" |
*
* @param {Admin_Role_UnknownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_role_unknown = /** @type {((inputs?: Admin_Role_UnknownInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Role_UnknownInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_role_unknown(inputs)
	return es_admin_role_unknown(inputs)
});