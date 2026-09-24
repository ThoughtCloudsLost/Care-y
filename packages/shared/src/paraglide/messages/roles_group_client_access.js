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

const en_xa2_roles_group_client_access = /** @type {(inputs: Roles_Group_Client_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè clìènt's àccèss tò thè càsè ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The client's access to the case" |
*
* @param {Roles_Group_Client_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_client_access = /** @type {((inputs?: Roles_Group_Client_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_Client_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_client_access(inputs)
	if (locale === "en-XA") return en_xa2_roles_group_client_access(inputs)
	return en_roles_group_client_access(inputs)
});