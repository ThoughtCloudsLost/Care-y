/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Channel_SmsInputs */

const en_notif_channel_sms = /** @type {(inputs: Notif_Channel_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS`)
};

const es_notif_channel_sms = /** @type {(inputs: Notif_Channel_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS`)
};

const en_xa2_notif_channel_sms = /** @type {(inputs: Notif_Channel_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS •⟧`)
};

/**
* | output |
* | --- |
* | "SMS" |
*
* @param {Notif_Channel_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_channel_sms = /** @type {((inputs?: Notif_Channel_SmsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Channel_SmsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_channel_sms(inputs)
	if (locale === "en-XA") return en_xa2_notif_channel_sms(inputs)
	return en_notif_channel_sms(inputs)
});