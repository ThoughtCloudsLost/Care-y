/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Presets_SubtitleInputs */

const en_hub_presets_subtitle = /** @type {(inputs: Hub_Presets_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reusable reply templates for composing messages`)
};

const es_hub_presets_subtitle = /** @type {(inputs: Hub_Presets_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plantillas de respuesta reutilizables para redactar mensajes`)
};

const en_xa2_hub_presets_subtitle = /** @type {(inputs: Hub_Presets_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèùsàblè rèply tèmplàtès fòr còmpòsìng mèssàgès •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reusable reply templates for composing messages" |
*
* @param {Hub_Presets_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_presets_subtitle = /** @type {((inputs?: Hub_Presets_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Presets_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_presets_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_presets_subtitle(inputs)
	return en_hub_presets_subtitle(inputs)
});