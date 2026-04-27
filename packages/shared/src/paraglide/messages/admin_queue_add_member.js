/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Add_MemberInputs */

const en_admin_queue_add_member = /** @type {(inputs: Admin_Queue_Add_MemberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add member`)
};

const es_admin_queue_add_member = /** @type {(inputs: Admin_Queue_Add_MemberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar miembro`)
};

/**
* | output |
* | --- |
* | "Add member" |
*
* @param {Admin_Queue_Add_MemberInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_add_member = /** @type {((inputs?: Admin_Queue_Add_MemberInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Add_MemberInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_add_member(inputs)
	return es_admin_queue_add_member(inputs)
});