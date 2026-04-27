/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Role_VolunteerInputs */

const en_admin_role_volunteer = /** @type {(inputs: Admin_Role_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer`)
};

const es_admin_role_volunteer = /** @type {(inputs: Admin_Role_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voluntario`)
};

/**
* | output |
* | --- |
* | "Volunteer" |
*
* @param {Admin_Role_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_role_volunteer = /** @type {((inputs?: Admin_Role_VolunteerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Role_VolunteerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_role_volunteer(inputs)
	return es_admin_role_volunteer(inputs)
});