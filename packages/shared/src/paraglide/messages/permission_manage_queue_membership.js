/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Queue_MembershipInputs */

const en_permission_manage_queue_membership = /** @type {(inputs: Permission_Manage_Queue_MembershipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add and remove queue members`)
};

const es_permission_manage_queue_membership = /** @type {(inputs: Permission_Manage_Queue_MembershipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar y quitar miembros de una cola`)
};

/**
* | output |
* | --- |
* | "Add and remove queue members" |
*
* @param {Permission_Manage_Queue_MembershipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_membership = /** @type {((inputs?: Permission_Manage_Queue_MembershipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Queue_MembershipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_queue_membership(inputs)
	return en_permission_manage_queue_membership(inputs)
});