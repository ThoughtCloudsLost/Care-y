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

const en_xa2_admin_tab_keys = /** @type {(inputs: Admin_Tab_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Kèys ••⟧`)
};

/**
* | output |
* | --- |
* | "Keys" |
*
* @param {Admin_Tab_KeysInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_keys = /** @type {((inputs?: Admin_Tab_KeysInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_KeysInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_keys(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_keys(inputs)
	return en_admin_tab_keys(inputs)
});