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

const en_xa2_roles_group_intake = /** @type {(inputs: Roles_Group_IntakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè ••⟧`)
};

/**
* | output |
* | --- |
* | "Intake" |
*
* @param {Roles_Group_IntakeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_intake = /** @type {((inputs?: Roles_Group_IntakeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_IntakeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_intake(inputs)
	if (locale === "en-XA") return en_xa2_roles_group_intake(inputs)
	return en_roles_group_intake(inputs)
});