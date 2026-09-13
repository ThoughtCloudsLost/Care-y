/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_AdminInputs */

const en_roles_group_admin = /** @type {(inputs: Roles_Group_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin level`)
};

const es_roles_group_admin = /** @type {(inputs: Roles_Group_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nivel administrador`)
};

/**
* | output |
* | --- |
* | "Admin level" |
*
* @param {Roles_Group_AdminInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_admin = /** @type {((inputs?: Roles_Group_AdminInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_AdminInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_group_admin(inputs)
	return es_roles_group_admin(inputs)
});