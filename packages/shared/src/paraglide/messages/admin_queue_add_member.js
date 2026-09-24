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

const en_xa2_admin_queue_add_member = /** @type {(inputs: Admin_Queue_Add_MemberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd mèmbèr •••⟧`)
};

/**
* | output |
* | --- |
* | "Add member" |
*
* @param {Admin_Queue_Add_MemberInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_add_member = /** @type {((inputs?: Admin_Queue_Add_MemberInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Add_MemberInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_add_member(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_add_member(inputs)
	return en_admin_queue_add_member(inputs)
});