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

/**
* | output |
* | --- |
* | "SMS" |
*
* @param {Admin_Channel_Sms_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_sms_label = /** @type {((inputs?: Admin_Channel_Sms_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Sms_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_channel_sms_label(inputs)
	return es_admin_channel_sms_label(inputs)
});