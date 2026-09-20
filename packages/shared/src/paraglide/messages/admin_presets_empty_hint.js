/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Empty_HintInputs */

const en_admin_presets_empty_hint = /** @type {(inputs: Admin_Presets_Empty_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap Add reply to create one.`)
};

const es_admin_presets_empty_hint = /** @type {(inputs: Admin_Presets_Empty_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Agregar respuesta para crear una.`)
};

const en_xa2_admin_presets_empty_hint = /** @type {(inputs: Admin_Presets_Empty_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp Àdd rèply tò crèàtè ònè. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap Add reply to create one." |
*
* @param {Admin_Presets_Empty_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_empty_hint = /** @type {((inputs?: Admin_Presets_Empty_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Empty_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_empty_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_empty_hint(inputs)
	return en_admin_presets_empty_hint(inputs)
});