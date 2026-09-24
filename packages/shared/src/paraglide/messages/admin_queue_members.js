/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Queue_MembersInputs */

const en_admin_queue_members = /** @type {(inputs: Admin_Queue_MembersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} members`)
};

const es_admin_queue_members = /** @type {(inputs: Admin_Queue_MembersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} miembros`)
};

const en_xa2_admin_queue_members = /** @type {(inputs: Admin_Queue_MembersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} mèmbèrs •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} members" |
*
* @param {Admin_Queue_MembersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_members = /** @type {((inputs: Admin_Queue_MembersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_MembersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_members(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_members(inputs)
	return en_admin_queue_members(inputs)
});