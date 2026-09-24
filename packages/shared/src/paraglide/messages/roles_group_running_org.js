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

const en_xa2_roles_group_running_org = /** @type {(inputs: Roles_Group_Running_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rùnnìng thè òrgànìzàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Running the organization" |
*
* @param {Roles_Group_Running_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_running_org = /** @type {((inputs?: Roles_Group_Running_OrgInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Running_OrgInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_running_org(inputs)
	if (locale === "en-XA") return en_xa2_roles_group_running_org(inputs)
	return en_roles_group_running_org(inputs)
});