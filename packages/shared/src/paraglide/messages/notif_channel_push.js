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

const en_xa2_notif_channel_push = /** @type {(inputs: Notif_Channel_PushInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pùsh ••⟧`)
};

/**
* | output |
* | --- |
* | "Push" |
*
* @param {Notif_Channel_PushInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_channel_push = /** @type {((inputs?: Notif_Channel_PushInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Channel_PushInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_channel_push(inputs)
	if (locale === "en-XA") return en_xa2_notif_channel_push(inputs)
	return en_notif_channel_push(inputs)
});