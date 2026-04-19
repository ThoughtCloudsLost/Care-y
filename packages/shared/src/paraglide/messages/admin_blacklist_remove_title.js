/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blacklist_Remove_TitleInputs */

const en_admin_blacklist_remove_title = /** @type {(inputs: Admin_Blacklist_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove blocked number`)
};

const es_admin_blacklist_remove_title = /** @type {(inputs: Admin_Blacklist_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar numero bloqueado`)
};

/**
* | output |
* | --- |
* | "Remove blocked number" |
*
* @param {Admin_Blacklist_Remove_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_remove_title = /** @type {((inputs?: Admin_Blacklist_Remove_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blacklist_Remove_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blacklist_remove_title(inputs)
	return es_admin_blacklist_remove_title(inputs)
});