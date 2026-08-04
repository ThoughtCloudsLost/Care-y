/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Channel_PushInputs */

const en_notif_channel_push = /** @type {(inputs: Notif_Channel_PushInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Push`)
};

const es_notif_channel_push = /** @type {(inputs: Notif_Channel_PushInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Push`)
};

/**
* | output |
* | --- |
* | "Push" |
*
* @param {Notif_Channel_PushInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_channel_push = /** @type {((inputs?: Notif_Channel_PushInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Channel_PushInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_channel_push(inputs)
	return es_notif_channel_push(inputs)
});