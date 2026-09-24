/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown>, tickets: NonNullable<unknown> }} Getting_Started_Presets_DescInputs */

const en_getting_started_presets_desc = /** @type {(inputs: Getting_Started_Presets_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create quick-response templates ${i?.volunteers} can send in ${i?.tickets}.`)
};

const es_getting_started_presets_desc = /** @type {(inputs: Getting_Started_Presets_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crea plantillas de respuesta rápida que los ${i?.volunteers} pueden enviar en ${i?.tickets}.`)
};

const en_xa2_getting_started_presets_desc = /** @type {(inputs: Getting_Started_Presets_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè qùìck-rèspònsè tèmplàtès  ••••••••••${i?.volunteers} càn sènd ìn  ••••${i?.tickets}. •⟧`)
};

/**
* | output |
* | --- |
* | "Create quick-response templates {volunteers} can send in {tickets}." |
*
* @param {Getting_Started_Presets_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_presets_desc = /** @type {((inputs: Getting_Started_Presets_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Presets_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_presets_desc(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_presets_desc(inputs)
	return en_getting_started_presets_desc(inputs)
});