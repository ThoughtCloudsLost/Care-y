/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Group_VolunteerInputs */

const en_admin_terminology_group_volunteer = /** @type {(inputs: Admin_Terminology_Group_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Team member role`)
};

const es_admin_terminology_group_volunteer = /** @type {(inputs: Admin_Terminology_Group_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol de miembro del equipo`)
};

const en_xa2_admin_terminology_group_volunteer = /** @type {(inputs: Admin_Terminology_Group_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèàm mèmbèr ròlè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Team member role" |
*
* @param {Admin_Terminology_Group_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_volunteer = /** @type {((inputs?: Admin_Terminology_Group_VolunteerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Group_VolunteerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_group_volunteer(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_group_volunteer(inputs)
	return en_admin_terminology_group_volunteer(inputs)
});