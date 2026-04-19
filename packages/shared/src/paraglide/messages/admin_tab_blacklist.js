/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_BlacklistInputs */

const en_admin_tab_blacklist = /** @type {(inputs: Admin_Tab_BlacklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blacklist`)
};

const es_admin_tab_blacklist = /** @type {(inputs: Admin_Tab_BlacklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista negra`)
};

/**
* | output |
* | --- |
* | "Blacklist" |
*
* @param {Admin_Tab_BlacklistInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_blacklist = /** @type {((inputs?: Admin_Tab_BlacklistInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_BlacklistInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_blacklist(inputs)
	return es_admin_tab_blacklist(inputs)
});