/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Only_Admins_Can_Assign_RolesInputs */

const en_error_only_admins_can_assign_roles = /** @type {(inputs: Error_Only_Admins_Can_Assign_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only admins can assign non-default roles.`)
};

const es_error_only_admins_can_assign_roles = /** @type {(inputs: Error_Only_Admins_Can_Assign_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo los administradores pueden asignar roles no predeterminados.`)
};

/**
* | output |
* | --- |
* | "Only admins can assign non-default roles." |
*
* @param {Error_Only_Admins_Can_Assign_RolesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_only_admins_can_assign_roles = /** @type {((inputs?: Error_Only_Admins_Can_Assign_RolesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Only_Admins_Can_Assign_RolesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_only_admins_can_assign_roles(inputs)
	return es_error_only_admins_can_assign_roles(inputs)
});