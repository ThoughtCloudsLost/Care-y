/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_PresetsInputs */

const en_panel_presets = /** @type {(inputs: Panel_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved Replies`)
};

const es_panel_presets = /** @type {(inputs: Panel_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas guardadas`)
};

const en_xa2_panel_presets = /** @type {(inputs: Panel_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvèd Rèplìès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Saved Replies" |
*
* @param {Panel_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_presets = /** @type {((inputs?: Panel_PresetsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_PresetsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_presets(inputs)
	if (locale === "en-XA") return en_xa2_panel_presets(inputs)
	return en_panel_presets(inputs)
});