/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Blacklist_Show_AllInputs */

const en_admin_blacklist_show_all = /** @type {(inputs: Admin_Blacklist_Show_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Show ${i?.count} more`)
};

const es_admin_blacklist_show_all = /** @type {(inputs: Admin_Blacklist_Show_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mostrar ${i?.count} mas`)
};

/**
* | output |
* | --- |
* | "Show {count} more" |
*
* @param {Admin_Blacklist_Show_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_show_all = /** @type {((inputs: Admin_Blacklist_Show_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blacklist_Show_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blacklist_show_all(inputs)
	return es_admin_blacklist_show_all(inputs)
});