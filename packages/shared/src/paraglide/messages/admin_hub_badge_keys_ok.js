/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Hub_Badge_Keys_OkInputs */

const en_admin_hub_badge_keys_ok = /** @type {(inputs: Admin_Hub_Badge_Keys_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ready`)
};

const es_admin_hub_badge_keys_ok = /** @type {(inputs: Admin_Hub_Badge_Keys_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Listas`)
};

const en_xa2_admin_hub_badge_keys_ok = /** @type {(inputs: Admin_Hub_Badge_Keys_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèàdy ••⟧`)
};

/**
* | output |
* | --- |
* | "Ready" |
*
* @param {Admin_Hub_Badge_Keys_OkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_keys_ok = /** @type {((inputs?: Admin_Hub_Badge_Keys_OkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_Keys_OkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_hub_badge_keys_ok(inputs)
	if (locale === "en-XA") return en_xa2_admin_hub_badge_keys_ok(inputs)
	return en_admin_hub_badge_keys_ok(inputs)
});