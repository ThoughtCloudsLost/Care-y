/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Reset_All_TitleInputs */

const en_notif_reset_all_title = /** @type {(inputs: Notif_Reset_All_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset notification preferences?`)
};

const es_notif_reset_all_title = /** @type {(inputs: Notif_Reset_All_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer preferencias de notificacion?`)
};

/**
* | output |
* | --- |
* | "Reset notification preferences?" |
*
* @param {Notif_Reset_All_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_title = /** @type {((inputs?: Notif_Reset_All_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Reset_All_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_reset_all_title(inputs)
	return es_notif_reset_all_title(inputs)
});