/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Hub_Badge_Keys_MissingInputs */

const en_admin_hub_badge_keys_missing = /** @type {(inputs: Admin_Hub_Badge_Keys_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Action needed`)
};

const es_admin_hub_badge_keys_missing = /** @type {(inputs: Admin_Hub_Badge_Keys_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acción necesaria`)
};

const en_xa2_admin_hub_badge_keys_missing = /** @type {(inputs: Admin_Hub_Badge_Keys_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctìòn nèèdèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Action needed" |
*
* @param {Admin_Hub_Badge_Keys_MissingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_keys_missing = /** @type {((inputs?: Admin_Hub_Badge_Keys_MissingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_Keys_MissingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_hub_badge_keys_missing(inputs)
	if (locale === "en-XA") return en_xa2_admin_hub_badge_keys_missing(inputs)
	return en_admin_hub_badge_keys_missing(inputs)
});