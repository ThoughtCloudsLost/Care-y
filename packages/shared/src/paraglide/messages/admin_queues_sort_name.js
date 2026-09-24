/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_Sort_NameInputs */

const en_admin_queues_sort_name = /** @type {(inputs: Admin_Queues_Sort_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Name`)
};

const es_admin_queues_sort_name = /** @type {(inputs: Admin_Queues_Sort_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre`)
};

const en_xa2_admin_queues_sort_name = /** @type {(inputs: Admin_Queues_Sort_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nàmè ••⟧`)
};

/**
* | output |
* | --- |
* | "Name" |
*
* @param {Admin_Queues_Sort_NameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_name = /** @type {((inputs?: Admin_Queues_Sort_NameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Sort_NameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_sort_name(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_sort_name(inputs)
	return en_admin_queues_sort_name(inputs)
});