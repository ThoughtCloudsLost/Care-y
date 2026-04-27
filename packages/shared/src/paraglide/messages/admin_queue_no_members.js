/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_No_MembersInputs */

const en_admin_queue_no_members = /** @type {(inputs: Admin_Queue_No_MembersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No members`)
};

const es_admin_queue_no_members = /** @type {(inputs: Admin_Queue_No_MembersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin miembros`)
};

/**
* | output |
* | --- |
* | "No members" |
*
* @param {Admin_Queue_No_MembersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_no_members = /** @type {((inputs?: Admin_Queue_No_MembersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_No_MembersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_no_members(inputs)
	return es_admin_queue_no_members(inputs)
});