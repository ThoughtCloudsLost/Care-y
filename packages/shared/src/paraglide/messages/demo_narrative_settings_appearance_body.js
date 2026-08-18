/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Appearance_BodyInputs */

const en_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can toggle between light and dark color schemes. The preference is saved locally on the device and is not sent to the server.`)
};

const es_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden alternar entre esquemas de color claro y oscuro. La preferencia se guarda localmente en el dispositivo y no se envia al servidor.`)
};

/**
* | output |
* | --- |
* | "Volunteers can toggle between light and dark color schemes. The preference is saved locally on the device and is not sent to the server." |
*
* @param {Demo_Narrative_Settings_Appearance_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_appearance_body = /** @type {((inputs?: Demo_Narrative_Settings_Appearance_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Appearance_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_appearance_body(inputs)
	return es_demo_narrative_settings_appearance_body(inputs)
});