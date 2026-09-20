/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Hub_Badge_GreetingsInputs */

const en_admin_hub_badge_greetings = /** @type {(inputs: Admin_Hub_Badge_GreetingsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} greetings`)
};

const es_admin_hub_badge_greetings = /** @type {(inputs: Admin_Hub_Badge_GreetingsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} saludos`)
};

const en_xa2_admin_hub_badge_greetings = /** @type {(inputs: Admin_Hub_Badge_GreetingsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} grèètìngs •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} greetings" |
*
* @param {Admin_Hub_Badge_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_greetings = /** @type {((inputs: Admin_Hub_Badge_GreetingsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_GreetingsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_hub_badge_greetings(inputs)
	if (locale === "en-XA") return en_xa2_admin_hub_badge_greetings(inputs)
	return en_admin_hub_badge_greetings(inputs)
});