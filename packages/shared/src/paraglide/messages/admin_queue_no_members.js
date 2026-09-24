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

const en_xa2_admin_queue_no_members = /** @type {(inputs: Admin_Queue_No_MembersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò mèmbèrs •••⟧`)
};

/**
* | output |
* | --- |
* | "No members" |
*
* @param {Admin_Queue_No_MembersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_no_members = /** @type {((inputs?: Admin_Queue_No_MembersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_No_MembersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_no_members(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_no_members(inputs)
	return en_admin_queue_no_members(inputs)
});