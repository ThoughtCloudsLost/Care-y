/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Hub_Badge_Keys_OkInputs */

const en_admin_hub_badge_keys_ok = /** @type {(inputs: Admin_Hub_Badge_Keys_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OK`)
};

const es_admin_hub_badge_keys_ok = /** @type {(inputs: Admin_Hub_Badge_Keys_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OK`)
};

/**
* | output |
* | --- |
* | "OK" |
*
* @param {Admin_Hub_Badge_Keys_OkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_keys_ok = /** @type {((inputs?: Admin_Hub_Badge_Keys_OkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_Keys_OkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_keys_ok(inputs)
	return es_admin_hub_badge_keys_ok(inputs)
});