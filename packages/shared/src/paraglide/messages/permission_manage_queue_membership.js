/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Queue_MembershipInputs */

const en_permission_manage_queue_membership = /** @type {(inputs: Permission_Manage_Queue_MembershipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage queue membership`)
};

const es_permission_manage_queue_membership = /** @type {(inputs: Permission_Manage_Queue_MembershipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar membresía de colas`)
};

const en_xa2_permission_manage_queue_membership = /** @type {(inputs: Permission_Manage_Queue_MembershipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè qùèùè mèmbèrshìp •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage queue membership" |
*
* @param {Permission_Manage_Queue_MembershipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_membership = /** @type {((inputs?: Permission_Manage_Queue_MembershipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Queue_MembershipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_queue_membership(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_queue_membership(inputs)
	return en_permission_manage_queue_membership(inputs)
});