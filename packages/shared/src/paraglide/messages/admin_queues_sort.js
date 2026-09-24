/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_SortInputs */

const en_admin_queues_sort = /** @type {(inputs: Admin_Queues_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sort`)
};

const es_admin_queues_sort = /** @type {(inputs: Admin_Queues_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ordenar`)
};

const en_xa2_admin_queues_sort = /** @type {(inputs: Admin_Queues_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòrt ••⟧`)
};

/**
* | output |
* | --- |
* | "Sort" |
*
* @param {Admin_Queues_SortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort = /** @type {((inputs?: Admin_Queues_SortInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_SortInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_sort(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_sort(inputs)
	return en_admin_queues_sort(inputs)
});