/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_Channel_PolicyInputs */

const en_admin_tab_channel_policy = /** @type {(inputs: Admin_Tab_Channel_PolicyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Channel Policy`)
};

const es_admin_tab_channel_policy = /** @type {(inputs: Admin_Tab_Channel_PolicyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Política de canales`)
};

/**
* | output |
* | --- |
* | "Channel Policy" |
*
* @param {Admin_Tab_Channel_PolicyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_channel_policy = /** @type {((inputs?: Admin_Tab_Channel_PolicyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_Channel_PolicyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_channel_policy(inputs)
	return en_admin_tab_channel_policy(inputs)
});