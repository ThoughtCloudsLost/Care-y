/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_Client_AccessInputs */

const en_roles_group_client_access = /** @type {(inputs: Roles_Group_Client_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The client's access to the case`)
};

const es_roles_group_client_access = /** @type {(inputs: Roles_Group_Client_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acceso del cliente al caso`)
};

/**
* | output |
* | --- |
* | "The client's access to the case" |
*
* @param {Roles_Group_Client_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_client_access = /** @type {((inputs?: Roles_Group_Client_AccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Client_AccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_client_access(inputs)
	return en_roles_group_client_access(inputs)
});