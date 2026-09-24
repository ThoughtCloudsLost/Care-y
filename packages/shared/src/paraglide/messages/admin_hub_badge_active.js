/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Hub_Badge_ActiveInputs */

const en_admin_hub_badge_active = /** @type {(inputs: Admin_Hub_Badge_ActiveInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} active`)
};

const es_admin_hub_badge_active = /** @type {(inputs: Admin_Hub_Badge_ActiveInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} activos`)
};

const en_xa2_admin_hub_badge_active = /** @type {(inputs: Admin_Hub_Badge_ActiveInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} àctìvè •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} active" |
*
* @param {Admin_Hub_Badge_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_active = /** @type {((inputs: Admin_Hub_Badge_ActiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_ActiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_hub_badge_active(inputs)
	if (locale === "en-XA") return en_xa2_admin_hub_badge_active(inputs)
	return en_admin_hub_badge_active(inputs)
});