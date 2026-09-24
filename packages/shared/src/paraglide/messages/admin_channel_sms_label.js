/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Sms_LabelInputs */

const en_admin_channel_sms_label = /** @type {(inputs: Admin_Channel_Sms_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS`)
};

const es_admin_channel_sms_label = /** @type {(inputs: Admin_Channel_Sms_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS`)
};

const en_xa2_admin_channel_sms_label = /** @type {(inputs: Admin_Channel_Sms_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS •⟧`)
};

/**
* | output |
* | --- |
* | "SMS" |
*
* @param {Admin_Channel_Sms_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_channel_sms_label = /** @type {((inputs?: Admin_Channel_Sms_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Sms_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_sms_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_channel_sms_label(inputs)
	return en_admin_channel_sms_label(inputs)
});