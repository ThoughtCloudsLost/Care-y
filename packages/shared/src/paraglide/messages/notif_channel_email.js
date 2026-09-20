/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Channel_EmailInputs */

const en_notif_channel_email = /** @type {(inputs: Notif_Channel_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email`)
};

const es_notif_channel_email = /** @type {(inputs: Notif_Channel_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email`)
};

const en_xa2_notif_channel_email = /** @type {(inputs: Notif_Channel_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl ••⟧`)
};

/**
* | output |
* | --- |
* | "Email" |
*
* @param {Notif_Channel_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_channel_email = /** @type {((inputs?: Notif_Channel_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Channel_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_channel_email(inputs)
	if (locale === "en-XA") return en_xa2_notif_channel_email(inputs)
	return en_notif_channel_email(inputs)
});