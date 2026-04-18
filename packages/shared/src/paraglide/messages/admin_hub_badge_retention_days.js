/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Hub_Badge_Retention_DaysInputs */

const en_admin_hub_badge_retention_days = /** @type {(inputs: Admin_Hub_Badge_Retention_DaysInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} days`)
};

const es_admin_hub_badge_retention_days = /** @type {(inputs: Admin_Hub_Badge_Retention_DaysInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} dias`)
};

/**
* | output |
* | --- |
* | "{count} days" |
*
* @param {Admin_Hub_Badge_Retention_DaysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_retention_days = /** @type {((inputs: Admin_Hub_Badge_Retention_DaysInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_Retention_DaysInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_retention_days(inputs)
	return es_admin_hub_badge_retention_days(inputs)
});