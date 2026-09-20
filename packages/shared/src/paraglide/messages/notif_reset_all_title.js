/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Reset_All_TitleInputs */

const en_notif_reset_all_title = /** @type {(inputs: Notif_Reset_All_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset notification preferences?`)
};

const es_notif_reset_all_title = /** @type {(inputs: Notif_Reset_All_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Restablecer preferencias de notificación?`)
};

const en_xa2_notif_reset_all_title = /** @type {(inputs: Notif_Reset_All_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsèt nòtìfìcàtìòn prèfèrèncès? ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reset notification preferences?" |
*
* @param {Notif_Reset_All_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_title = /** @type {((inputs?: Notif_Reset_All_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Reset_All_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_reset_all_title(inputs)
	if (locale === "en-XA") return en_xa2_notif_reset_all_title(inputs)
	return en_notif_reset_all_title(inputs)
});