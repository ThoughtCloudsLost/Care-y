/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Desc_ManagerInputs */

const en_admin_terminology_desc_manager = /** @type {(inputs: Admin_Terminology_Desc_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Team members with elevated access who oversee cases and supervise others.`)
};

const es_admin_terminology_desc_manager = /** @type {(inputs: Admin_Terminology_Desc_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Miembros del equipo con acceso elevado que supervisan casos y a otros miembros.`)
};

/**
* | output |
* | --- |
* | "Team members with elevated access who oversee cases and supervise others." |
*
* @param {Admin_Terminology_Desc_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_manager = /** @type {((inputs?: Admin_Terminology_Desc_ManagerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Desc_ManagerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_desc_manager(inputs)
	return es_admin_terminology_desc_manager(inputs)
});