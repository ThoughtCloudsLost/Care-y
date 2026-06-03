/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Group_ClientInputs */

const en_admin_terminology_group_client = /** @type {(inputs: Admin_Terminology_Group_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Person helped`)
};

const es_admin_terminology_group_client = /** @type {(inputs: Admin_Terminology_Group_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Persona asistida`)
};

/**
* | output |
* | --- |
* | "Person helped" |
*
* @param {Admin_Terminology_Group_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_client = /** @type {((inputs?: Admin_Terminology_Group_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Group_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_group_client(inputs)
	return es_admin_terminology_group_client(inputs)
});