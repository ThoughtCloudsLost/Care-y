/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Policy_TitleInputs */

const en_admin_channel_policy_title = /** @type {(inputs: Admin_Channel_Policy_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Channel Policy`)
};

const es_admin_channel_policy_title = /** @type {(inputs: Admin_Channel_Policy_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Política de canales`)
};

const en_xa2_admin_channel_policy_title = /** @type {(inputs: Admin_Channel_Policy_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chànnèl Pòlìcy •••••⟧`)
};

/**
* | output |
* | --- |
* | "Channel Policy" |
*
* @param {Admin_Channel_Policy_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_channel_policy_title = /** @type {((inputs?: Admin_Channel_Policy_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Policy_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_policy_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_channel_policy_title(inputs)
	return en_admin_channel_policy_title(inputs)
});