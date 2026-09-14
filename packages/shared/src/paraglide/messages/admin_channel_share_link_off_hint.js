/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Share_Link_Off_HintInputs */

const en_admin_channel_share_link_off_hint = /** @type {(inputs: Admin_Channel_Share_Link_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers cannot send one-time share links.`)
};

const es_admin_channel_share_link_off_hint = /** @type {(inputs: Admin_Channel_Share_Link_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios no pueden enviar enlaces compartidos de un solo uso.`)
};

/**
* | output |
* | --- |
* | "Volunteers cannot send one-time share links." |
*
* @param {Admin_Channel_Share_Link_Off_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_share_link_off_hint = /** @type {((inputs?: Admin_Channel_Share_Link_Off_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Share_Link_Off_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_share_link_off_hint(inputs)
	return en_admin_channel_share_link_off_hint(inputs)
});