/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Queue_Remove_MemberInputs */

const en_admin_queue_remove_member = /** @type {(inputs: Admin_Queue_Remove_MemberInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Remove ${i?.name}`)
};

const es_admin_queue_remove_member = /** @type {(inputs: Admin_Queue_Remove_MemberInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Quitar ${i?.name}`)
};

const en_xa2_admin_queue_remove_member = /** @type {(inputs: Admin_Queue_Remove_MemberInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè  •••${i?.name}⟧`)
};

/**
* | output |
* | --- |
* | "Remove {name}" |
*
* @param {Admin_Queue_Remove_MemberInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_remove_member = /** @type {((inputs: Admin_Queue_Remove_MemberInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Remove_MemberInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_remove_member(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_remove_member(inputs)
	return en_admin_queue_remove_member(inputs)
});