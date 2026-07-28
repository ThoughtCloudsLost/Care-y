/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Profile_Identity_BodyInputs */

const en_demo_narrative_settings_profile_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Profile_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You can change your display name and username here. Both are real writes to the database running in your browser and reset when the demo restarts.`)
};

const es_demo_narrative_settings_profile_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Profile_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Puedes cambiar tu nombre visible y tu nombre de usuario aqui. Ambos son escrituras reales en la base de datos que corre en tu navegador y se reinician cuando el demo se reinicia.`)
};

/**
* | output |
* | --- |
* | "You can change your display name and username here. Both are real writes to the database running in your browser and reset when the demo restarts." |
*
* @param {Demo_Narrative_Settings_Profile_Identity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_profile_identity_body = /** @type {((inputs?: Demo_Narrative_Settings_Profile_Identity_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Profile_Identity_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_profile_identity_body(inputs)
	return es_demo_narrative_settings_profile_identity_body(inputs)
});