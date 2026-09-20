/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_Running_OrgInputs */

const en_roles_group_running_org = /** @type {(inputs: Roles_Group_Running_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Running the organization`)
};

const es_roles_group_running_org = /** @type {(inputs: Roles_Group_Running_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar la organización`)
};

/**
* | output |
* | --- |
* | "Running the organization" |
*
* @param {Roles_Group_Running_OrgInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_running_org = /** @type {((inputs?: Roles_Group_Running_OrgInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Running_OrgInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_running_org(inputs)
	return en_roles_group_running_org(inputs)
});