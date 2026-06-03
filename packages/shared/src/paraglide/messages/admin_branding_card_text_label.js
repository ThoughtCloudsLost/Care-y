/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, clients: NonNullable<unknown> }} Admin_Branding_Card_Text_LabelInputs */

const en_admin_branding_card_text_label = /** @type {(inputs: Admin_Branding_Card_Text_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} welcome text`)
};

const es_admin_branding_card_text_label = /** @type {(inputs: Admin_Branding_Card_Text_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Texto de bienvenida para ${i?.clients}`)
};

/**
* | output |
* | --- |
* | "{Client} welcome text" |
*
* @param {Admin_Branding_Card_Text_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_text_label = /** @type {((inputs: Admin_Branding_Card_Text_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Card_Text_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_card_text_label(inputs)
	return es_admin_branding_card_text_label(inputs)
});