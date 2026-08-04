/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_ManagerInputs */

const en_roles_group_manager = /** @type {(inputs: Roles_Group_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manager level`)
};

const es_roles_group_manager = /** @type {(inputs: Roles_Group_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nivel coordinador`)
};

/**
* | output |
* | --- |
* | "Manager level" |
*
* @param {Roles_Group_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_manager = /** @type {((inputs?: Roles_Group_ManagerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_ManagerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_group_manager(inputs)
	return es_roles_group_manager(inputs)
});