/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Presets_DescInputs */

const en_getting_started_presets_desc = /** @type {(inputs: Getting_Started_Presets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create quick-response templates volunteers can send in tickets.`)
};

const es_getting_started_presets_desc = /** @type {(inputs: Getting_Started_Presets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crea plantillas de respuesta rapida que los voluntarios pueden enviar en tickets.`)
};

/**
* | output |
* | --- |
* | "Create quick-response templates volunteers can send in tickets." |
*
* @param {Getting_Started_Presets_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_presets_desc = /** @type {((inputs?: Getting_Started_Presets_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Presets_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_presets_desc(inputs)
	return es_getting_started_presets_desc(inputs)
});