/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Policy_SavedInputs */

const en_admin_channel_policy_saved = /** @type {(inputs: Admin_Channel_Policy_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Channel policy updated`)
};

const es_admin_channel_policy_saved = /** @type {(inputs: Admin_Channel_Policy_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Política de canales actualizada`)
};

/**
* | output |
* | --- |
* | "Channel policy updated" |
*
* @param {Admin_Channel_Policy_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_policy_saved = /** @type {((inputs?: Admin_Channel_Policy_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Policy_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_channel_policy_saved(inputs)
	return es_admin_channel_policy_saved(inputs)
});