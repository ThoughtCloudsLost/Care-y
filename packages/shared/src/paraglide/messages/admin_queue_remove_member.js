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

/**
* | output |
* | --- |
* | "Remove {name}" |
*
* @param {Admin_Queue_Remove_MemberInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_remove_member = /** @type {((inputs: Admin_Queue_Remove_MemberInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Remove_MemberInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_remove_member(inputs)
	return es_admin_queue_remove_member(inputs)
});