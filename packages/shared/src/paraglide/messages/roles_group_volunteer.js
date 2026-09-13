/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_VolunteerInputs */

const en_roles_group_volunteer = /** @type {(inputs: Roles_Group_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer level`)
};

const es_roles_group_volunteer = /** @type {(inputs: Roles_Group_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nivel voluntario`)
};

/**
* | output |
* | --- |
* | "Volunteer level" |
*
* @param {Roles_Group_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_volunteer = /** @type {((inputs?: Roles_Group_VolunteerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_VolunteerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_group_volunteer(inputs)
	return es_roles_group_volunteer(inputs)
});