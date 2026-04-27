/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Sort_StatusInputs */

const en_admin_users_sort_status = /** @type {(inputs: Admin_Users_Sort_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

const es_admin_users_sort_status = /** @type {(inputs: Admin_Users_Sort_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado`)
};

/**
* | output |
* | --- |
* | "Status" |
*
* @param {Admin_Users_Sort_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_sort_status = /** @type {((inputs?: Admin_Users_Sort_StatusInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Sort_StatusInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_sort_status(inputs)
	return es_admin_users_sort_status(inputs)
});