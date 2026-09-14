/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Channel_Policy_SubtitleInputs */

const en_admin_channel_policy_subtitle = /** @type {(inputs: Admin_Channel_Policy_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Control which communication channels are available to volunteers.`)
};

const es_admin_channel_policy_subtitle = /** @type {(inputs: Admin_Channel_Policy_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Controla qué canales de comunicación están disponibles para los voluntarios.`)
};

/**
* | output |
* | --- |
* | "Control which communication channels are available to volunteers." |
*
* @param {Admin_Channel_Policy_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_policy_subtitle = /** @type {((inputs?: Admin_Channel_Policy_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Channel_Policy_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_channel_policy_subtitle(inputs)
	return en_admin_channel_policy_subtitle(inputs)
});