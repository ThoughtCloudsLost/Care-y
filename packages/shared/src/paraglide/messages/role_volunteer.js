/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Volunteer: NonNullable<unknown> }} Role_VolunteerInputs */

const en_role_volunteer = /** @type {(inputs: Role_VolunteerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Volunteer}`)
};

const es_role_volunteer = /** @type {(inputs: Role_VolunteerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Volunteer}`)
};

const en_xa2_role_volunteer = /** @type {(inputs: Role_VolunteerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Volunteer}⟧`)
};

/**
* | output |
* | --- |
* | "{Volunteer}" |
*
* @param {Role_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const role_volunteer = /** @type {((inputs: Role_VolunteerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Role_VolunteerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_role_volunteer(inputs)
	if (locale === "en-XA") return en_xa2_role_volunteer(inputs)
	return en_role_volunteer(inputs)
});