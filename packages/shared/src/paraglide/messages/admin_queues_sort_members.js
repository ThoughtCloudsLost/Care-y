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

/**
* | output |
* | --- |
* | "Members" |
*
* @param {Admin_Queues_Sort_MembersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_members = /** @type {((inputs?: Admin_Queues_Sort_MembersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Sort_MembersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_sort_members(inputs)
	return es_admin_queues_sort_members(inputs)
});