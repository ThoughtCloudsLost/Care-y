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

const en_xa2_admin_hub_badge_blocked = /** @type {(inputs: Admin_Hub_Badge_BlockedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} blòckèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} blocked" |
*
* @param {Admin_Hub_Badge_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_blocked = /** @type {((inputs: Admin_Hub_Badge_BlockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_BlockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_hub_badge_blocked(inputs)
	if (locale === "en-XA") return en_xa2_admin_hub_badge_blocked(inputs)
	return en_admin_hub_badge_blocked(inputs)
});