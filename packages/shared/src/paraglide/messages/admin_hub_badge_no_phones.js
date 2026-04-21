/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Hub_Badge_No_PhonesInputs */

const en_admin_hub_badge_no_phones = /** @type {(inputs: Admin_Hub_Badge_No_PhonesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No phones`)
};

const es_admin_hub_badge_no_phones = /** @type {(inputs: Admin_Hub_Badge_No_PhonesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin teléfonos`)
};

/**
* | output |
* | --- |
* | "No phones" |
*
* @param {Admin_Hub_Badge_No_PhonesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_no_phones = /** @type {((inputs?: Admin_Hub_Badge_No_PhonesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_No_PhonesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_no_phones(inputs)
	return es_admin_hub_badge_no_phones(inputs)
});