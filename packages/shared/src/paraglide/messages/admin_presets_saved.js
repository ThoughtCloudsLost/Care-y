/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_SavedInputs */

const en_admin_presets_saved = /** @type {(inputs: Admin_Presets_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved reply updated.`)
};

const es_admin_presets_saved = /** @type {(inputs: Admin_Presets_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta guardada actualizada.`)
};

const en_xa2_admin_presets_saved = /** @type {(inputs: Admin_Presets_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvèd rèply ùpdàtèd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Saved reply updated." |
*
* @param {Admin_Presets_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_saved = /** @type {((inputs?: Admin_Presets_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_saved(inputs)
	return en_admin_presets_saved(inputs)
});