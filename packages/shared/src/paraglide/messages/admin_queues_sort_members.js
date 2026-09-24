/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_Sort_MembersInputs */

const en_admin_queues_sort_members = /** @type {(inputs: Admin_Queues_Sort_MembersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Members`)
};

const es_admin_queues_sort_members = /** @type {(inputs: Admin_Queues_Sort_MembersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Miembros`)
};

const en_xa2_admin_queues_sort_members = /** @type {(inputs: Admin_Queues_Sort_MembersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèmbèrs •••⟧`)
};

/**
* | output |
* | --- |
* | "Members" |
*
* @param {Admin_Queues_Sort_MembersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_members = /** @type {((inputs?: Admin_Queues_Sort_MembersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Sort_MembersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_sort_members(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_sort_members(inputs)
	return en_admin_queues_sort_members(inputs)
});