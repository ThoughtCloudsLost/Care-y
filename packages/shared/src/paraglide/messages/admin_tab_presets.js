/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_PresetsInputs */

const en_admin_tab_presets = /** @type {(inputs: Admin_Tab_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved Replies`)
};

const es_admin_tab_presets = /** @type {(inputs: Admin_Tab_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas guardadas`)
};

const en_xa2_admin_tab_presets = /** @type {(inputs: Admin_Tab_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvèd Rèplìès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Saved Replies" |
*
* @param {Admin_Tab_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_presets = /** @type {((inputs?: Admin_Tab_PresetsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_PresetsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_presets(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_presets(inputs)
	return en_admin_tab_presets(inputs)
});