/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Member_AddedInputs */

const en_admin_queue_member_added = /** @type {(inputs: Admin_Queue_Member_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Member added`)
};

const es_admin_queue_member_added = /** @type {(inputs: Admin_Queue_Member_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Miembro agregado`)
};

/**
* | output |
* | --- |
* | "Member added" |
*
* @param {Admin_Queue_Member_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_added = /** @type {((inputs?: Admin_Queue_Member_AddedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Member_AddedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_member_added(inputs)
	return es_admin_queue_member_added(inputs)
});