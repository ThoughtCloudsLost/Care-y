/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Hub_Badge_BlockedInputs */

const en_admin_hub_badge_blocked = /** @type {(inputs: Admin_Hub_Badge_BlockedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} blocked`)
};

const es_admin_hub_badge_blocked = /** @type {(inputs: Admin_Hub_Badge_BlockedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} bloqueados`)
};

/**
* | output |
* | --- |
* | "{count} blocked" |
*
* @param {Admin_Hub_Badge_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_blocked = /** @type {((inputs: Admin_Hub_Badge_BlockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_BlockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_blocked(inputs)
	return es_admin_hub_badge_blocked(inputs)
});