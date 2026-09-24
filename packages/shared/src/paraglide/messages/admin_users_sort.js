/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_SortInputs */

const en_admin_users_sort = /** @type {(inputs: Admin_Users_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sort users`)
};

const es_admin_users_sort = /** @type {(inputs: Admin_Users_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ordenar usuarios`)
};

const en_xa2_admin_users_sort = /** @type {(inputs: Admin_Users_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòrt ùsèrs •••⟧`)
};

/**
* | output |
* | --- |
* | "Sort users" |
*
* @param {Admin_Users_SortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_sort = /** @type {((inputs?: Admin_Users_SortInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_SortInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_sort(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_sort(inputs)
	return en_admin_users_sort(inputs)
});