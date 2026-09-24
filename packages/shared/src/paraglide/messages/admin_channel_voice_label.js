/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Voice_LabelInputs */

const en_admin_channel_voice_label = /** @type {(inputs: Admin_Channel_Voice_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voice`)
};

const es_admin_channel_voice_label = /** @type {(inputs: Admin_Channel_Voice_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voz`)
};

const en_xa2_admin_channel_voice_label = /** @type {(inputs: Admin_Channel_Voice_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcè ••⟧`)
};

/**
* | output |
* | --- |
* | "Voice" |
*
* @param {Admin_Channel_Voice_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_channel_voice_label = /** @type {((inputs?: Admin_Channel_Voice_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Voice_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_voice_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_channel_voice_label(inputs)
	return en_admin_channel_voice_label(inputs)
});