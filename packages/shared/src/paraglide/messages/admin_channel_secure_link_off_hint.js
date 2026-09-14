/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Secure_Link_Off_HintInputs */

const en_admin_channel_secure_link_off_hint = /** @type {(inputs: Admin_Channel_Secure_Link_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Portal setup and secure link messaging are unavailable.`)
};

const es_admin_channel_secure_link_off_hint = /** @type {(inputs: Admin_Channel_Secure_Link_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La configuración del portal y la mensajería por enlace seguro no están disponibles.`)
};

/**
* | output |
* | --- |
* | "Portal setup and secure link messaging are unavailable." |
*
* @param {Admin_Channel_Secure_Link_Off_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_secure_link_off_hint = /** @type {((inputs?: Admin_Channel_Secure_Link_Off_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Secure_Link_Off_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_secure_link_off_hint(inputs)
	return en_admin_channel_secure_link_off_hint(inputs)
});