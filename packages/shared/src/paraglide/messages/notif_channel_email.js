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

/**
* | output |
* | --- |
* | "Email" |
*
* @param {Notif_Channel_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_channel_email = /** @type {((inputs?: Notif_Channel_EmailInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Channel_EmailInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_channel_email(inputs)
	return es_notif_channel_email(inputs)
});