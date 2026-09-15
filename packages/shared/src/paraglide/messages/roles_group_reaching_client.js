/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_Reaching_ClientInputs */

const en_roles_group_reaching_client = /** @type {(inputs: Roles_Group_Reaching_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reaching a client`)
};

const es_roles_group_reaching_client = /** @type {(inputs: Roles_Group_Reaching_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contactar a un cliente`)
};

/**
* | output |
* | --- |
* | "Reaching a client" |
*
* @param {Roles_Group_Reaching_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_reaching_client = /** @type {((inputs?: Roles_Group_Reaching_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Reaching_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_reaching_client(inputs)
	return en_roles_group_reaching_client(inputs)
});