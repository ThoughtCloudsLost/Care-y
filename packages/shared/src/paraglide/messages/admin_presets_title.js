/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_TitleInputs */

const en_admin_presets_title = /** @type {(inputs: Admin_Presets_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved Replies`)
};

const es_admin_presets_title = /** @type {(inputs: Admin_Presets_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas guardadas`)
};

const en_xa2_admin_presets_title = /** @type {(inputs: Admin_Presets_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvèd Rèplìès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Saved Replies" |
*
* @param {Admin_Presets_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_title = /** @type {((inputs?: Admin_Presets_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_title(inputs)
	return en_admin_presets_title(inputs)
});