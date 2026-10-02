/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Webhook_RegisteredInputs */

const en_admin_donations_webhook_registered = /** @type {(inputs: Admin_Donations_Webhook_RegisteredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Donation webhook registered`)
};

const es_admin_donations_webhook_registered = /** @type {(inputs: Admin_Donations_Webhook_RegisteredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Webhook de donaciones registrado`)
};

const en_xa2_admin_donations_webhook_registered = /** @type {(inputs: Admin_Donations_Webhook_RegisteredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònàtìòn wèbhòòk règìstèrèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Donation webhook registered" |
*
* @param {Admin_Donations_Webhook_RegisteredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_webhook_registered = /** @type {((inputs?: Admin_Donations_Webhook_RegisteredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Webhook_RegisteredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_webhook_registered(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_webhook_registered(inputs)
	return en_admin_donations_webhook_registered(inputs)
});