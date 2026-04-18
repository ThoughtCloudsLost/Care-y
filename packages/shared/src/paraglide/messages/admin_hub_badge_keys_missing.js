/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Hub_Badge_Keys_MissingInputs */

const en_admin_hub_badge_keys_missing = /** @type {(inputs: Admin_Hub_Badge_Keys_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Action needed`)
};

const es_admin_hub_badge_keys_missing = /** @type {(inputs: Admin_Hub_Badge_Keys_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Accion necesaria`)
};

/**
* | output |
* | --- |
* | "Action needed" |
*
* @param {Admin_Hub_Badge_Keys_MissingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_keys_missing = /** @type {((inputs?: Admin_Hub_Badge_Keys_MissingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_Keys_MissingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_keys_missing(inputs)
	return es_admin_hub_badge_keys_missing(inputs)
});