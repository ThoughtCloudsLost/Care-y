/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_KeysInputs */

const en_admin_tab_keys = /** @type {(inputs: Admin_Tab_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Keys`)
};

const es_admin_tab_keys = /** @type {(inputs: Admin_Tab_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Claves`)
};

/**
* | output |
* | --- |
* | "Keys" |
*
* @param {Admin_Tab_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_keys = /** @type {((inputs?: Admin_Tab_KeysInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_KeysInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_keys(inputs)
	return es_admin_tab_keys(inputs)
});