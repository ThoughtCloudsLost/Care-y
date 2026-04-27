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

/**
* | output |
* | --- |
* | "{count} numbers" |
*
* @param {Admin_Hub_Badge_PhonesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_phones = /** @type {((inputs: Admin_Hub_Badge_PhonesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_PhonesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_phones(inputs)
	return es_admin_hub_badge_phones(inputs)
});