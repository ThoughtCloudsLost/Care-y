/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_No_AccessInputs */

const en_admin_org_no_access = /** @type {(inputs: Admin_Org_No_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You do not have permission to access organization settings.`)
};

const es_admin_org_no_access = /** @type {(inputs: Admin_Org_No_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No tienes permiso para acceder a la configuracion de la organizacion.`)
};

/**
* | output |
* | --- |
* | "You do not have permission to access organization settings." |
*
* @param {Admin_Org_No_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_no_access = /** @type {((inputs?: Admin_Org_No_AccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_No_AccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_no_access(inputs)
	return es_admin_org_no_access(inputs)
});