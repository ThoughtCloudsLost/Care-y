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

/**
* | output |
* | --- |
* | "Channel Policy" |
*
* @param {Admin_Channel_Policy_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_policy_title = /** @type {((inputs?: Admin_Channel_Policy_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Policy_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_channel_policy_title(inputs)
	return es_admin_channel_policy_title(inputs)
});