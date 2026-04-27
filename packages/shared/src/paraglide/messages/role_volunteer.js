/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Role_VolunteerInputs */

const en_role_volunteer = /** @type {(inputs: Role_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer`)
};

const es_role_volunteer = /** @type {(inputs: Role_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voluntario`)
};

/**
* | output |
* | --- |
* | "Volunteer" |
*
* @param {Role_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const role_volunteer = /** @type {((inputs?: Role_VolunteerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Role_VolunteerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_role_volunteer(inputs)
	return es_role_volunteer(inputs)
});