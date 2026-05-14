/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Desc_VolunteerInputs */

const en_admin_terminology_desc_volunteer = /** @type {(inputs: Admin_Terminology_Desc_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`People in your organization who handle cases and support clients.`)
};

const es_admin_terminology_desc_volunteer = /** @type {(inputs: Admin_Terminology_Desc_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personas en su organización que manejan casos y apoyan a los clientes.`)
};

/**
* | output |
* | --- |
* | "People in your organization who handle cases and support clients." |
*
* @param {Admin_Terminology_Desc_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_volunteer = /** @type {((inputs?: Admin_Terminology_Desc_VolunteerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Desc_VolunteerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_desc_volunteer(inputs)
	return es_admin_terminology_desc_volunteer(inputs)
});