/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Secure_Link_LabelInputs */

const en_admin_channel_secure_link_label = /** @type {(inputs: Admin_Channel_Secure_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure Link`)
};

const es_admin_channel_secure_link_label = /** @type {(inputs: Admin_Channel_Secure_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace seguro`)
};

/**
* | output |
* | --- |
* | "Secure Link" |
*
* @param {Admin_Channel_Secure_Link_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_secure_link_label = /** @type {((inputs?: Admin_Channel_Secure_Link_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Secure_Link_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_secure_link_label(inputs)
	return en_admin_channel_secure_link_label(inputs)
});