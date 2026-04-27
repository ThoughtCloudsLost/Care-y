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

/**
* | output |
* | --- |
* | "{count} greetings" |
*
* @param {Admin_Hub_Badge_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_greetings = /** @type {((inputs: Admin_Hub_Badge_GreetingsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_GreetingsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_greetings(inputs)
	return es_admin_hub_badge_greetings(inputs)
});