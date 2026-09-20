/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Hub_Badge_PhonesInputs */

const en_admin_hub_badge_phones = /** @type {(inputs: Admin_Hub_Badge_PhonesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} numbers`)
};

const es_admin_hub_badge_phones = /** @type {(inputs: Admin_Hub_Badge_PhonesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} números`)
};

const en_xa2_admin_hub_badge_phones = /** @type {(inputs: Admin_Hub_Badge_PhonesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} nùmbèrs •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} numbers" |
*
* @param {Admin_Hub_Badge_PhonesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_phones = /** @type {((inputs: Admin_Hub_Badge_PhonesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_PhonesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_hub_badge_phones(inputs)
	if (locale === "en-XA") return en_xa2_admin_hub_badge_phones(inputs)
	return en_admin_hub_badge_phones(inputs)
});