/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Section_TitleInputs */

const en_notif_section_title = /** @type {(inputs: Notif_Section_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notifications`)
};

const es_notif_section_title = /** @type {(inputs: Notif_Section_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificaciones`)
};

const en_xa2_notif_section_title = /** @type {(inputs: Notif_Section_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtìfìcàtìòns ••••⟧`)
};

/**
* | output |
* | --- |
* | "Notifications" |
*
* @param {Notif_Section_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_section_title = /** @type {((inputs?: Notif_Section_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Section_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_section_title(inputs)
	if (locale === "en-XA") return en_xa2_notif_section_title(inputs)
	return en_notif_section_title(inputs)
});