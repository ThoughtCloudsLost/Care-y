/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Queues_Stat_MembersInputs */

const en_admin_queues_stat_members = /** @type {(inputs: Admin_Queues_Stat_MembersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} members`)
};

const es_admin_queues_stat_members = /** @type {(inputs: Admin_Queues_Stat_MembersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} miembros`)
};

const en_xa2_admin_queues_stat_members = /** @type {(inputs: Admin_Queues_Stat_MembersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} mèmbèrs •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} members" |
*
* @param {Admin_Queues_Stat_MembersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_stat_members = /** @type {((inputs: Admin_Queues_Stat_MembersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Stat_MembersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_stat_members(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_stat_members(inputs)
	return en_admin_queues_stat_members(inputs)
});