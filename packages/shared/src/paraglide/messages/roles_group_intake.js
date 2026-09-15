/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_IntakeInputs */

const en_roles_group_intake = /** @type {(inputs: Roles_Group_IntakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake`)
};

const es_roles_group_intake = /** @type {(inputs: Roles_Group_IntakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingreso`)
};

/**
* | output |
* | --- |
* | "Intake" |
*
* @param {Roles_Group_IntakeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_intake = /** @type {((inputs?: Roles_Group_IntakeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_IntakeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_intake(inputs)
	return en_roles_group_intake(inputs)
});