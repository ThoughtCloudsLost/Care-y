/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blacklist_Already_BlockedInputs */

const en_admin_blacklist_already_blocked = /** @type {(inputs: Admin_Blacklist_Already_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This number is already blocked.`)
};

const es_admin_blacklist_already_blocked = /** @type {(inputs: Admin_Blacklist_Already_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este numero ya esta bloqueado.`)
};

/**
* | output |
* | --- |
* | "This number is already blocked." |
*
* @param {Admin_Blacklist_Already_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_already_blocked = /** @type {((inputs?: Admin_Blacklist_Already_BlockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blacklist_Already_BlockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blacklist_already_blocked(inputs)
	return es_admin_blacklist_already_blocked(inputs)
});