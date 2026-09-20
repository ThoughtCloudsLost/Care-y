/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Policy_ErrorInputs */

const en_admin_channel_policy_error = /** @type {(inputs: Admin_Channel_Policy_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not update channel policy`)
};

const es_admin_channel_policy_error = /** @type {(inputs: Admin_Channel_Policy_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo actualizar la política de canales`)
};

const en_xa2_admin_channel_policy_error = /** @type {(inputs: Admin_Channel_Policy_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùpdàtè chànnèl pòlìcy ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not update channel policy" |
*
* @param {Admin_Channel_Policy_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_channel_policy_error = /** @type {((inputs?: Admin_Channel_Policy_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Policy_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_policy_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_channel_policy_error(inputs)
	return en_admin_channel_policy_error(inputs)
});