/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Group_ManagerInputs */

const en_admin_terminology_group_manager = /** @type {(inputs: Admin_Terminology_Group_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Senior team member role`)
};

const es_admin_terminology_group_manager = /** @type {(inputs: Admin_Terminology_Group_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol superior del equipo`)
};

/**
* | output |
* | --- |
* | "Senior team member role" |
*
* @param {Admin_Terminology_Group_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_manager = /** @type {((inputs?: Admin_Terminology_Group_ManagerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Group_ManagerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_group_manager(inputs)
	return es_admin_terminology_group_manager(inputs)
});