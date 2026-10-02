/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Webhook_Not_RegisteredInputs */

const en_admin_donations_webhook_not_registered = /** @type {(inputs: Admin_Donations_Webhook_Not_RegisteredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Donation webhook not registered. Remove this connection and add it again to retry.`)
};

const es_admin_donations_webhook_not_registered = /** @type {(inputs: Admin_Donations_Webhook_Not_RegisteredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Webhook de donaciones no registrado. Quita esta conexión y vuelve a añadirla para reintentarlo.`)
};

const en_xa2_admin_donations_webhook_not_registered = /** @type {(inputs: Admin_Donations_Webhook_Not_RegisteredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònàtìòn wèbhòòk nòt règìstèrèd. Rèmòvè thìs cònnèctìòn ànd àdd ìt àgàìn tò rètry. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Donation webhook not registered. Remove this connection and add it again to retry." |
*
* @param {Admin_Donations_Webhook_Not_RegisteredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_webhook_not_registered = /** @type {((inputs?: Admin_Donations_Webhook_Not_RegisteredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Webhook_Not_RegisteredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_webhook_not_registered(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_webhook_not_registered(inputs)
	return en_admin_donations_webhook_not_registered(inputs)
});