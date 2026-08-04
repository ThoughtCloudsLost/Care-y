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

/**
* | output |
* | --- |
* | "SMS" |
*
* @param {Notif_Channel_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_channel_sms = /** @type {((inputs?: Notif_Channel_SmsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Channel_SmsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_channel_sms(inputs)
	return es_notif_channel_sms(inputs)
});