/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Merge_Channel_Kind_Secure_LinkInputs */

const en_merge_channel_kind_secure_link = /** @type {(inputs: Merge_Channel_Kind_Secure_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure Link`)
};

const es_merge_channel_kind_secure_link = /** @type {(inputs: Merge_Channel_Kind_Secure_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace seguro`)
};

/**
* | output |
* | --- |
* | "Secure Link" |
*
* @param {Merge_Channel_Kind_Secure_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_kind_secure_link = /** @type {((inputs?: Merge_Channel_Kind_Secure_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Merge_Channel_Kind_Secure_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_merge_channel_kind_secure_link(inputs)
	return es_merge_channel_kind_secure_link(inputs)
});