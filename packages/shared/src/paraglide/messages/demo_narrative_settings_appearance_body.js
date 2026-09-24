/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Appearance_BodyInputs */

const en_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Light and dark color schemes are available. The preference is saved locally on the device and is not sent to the server.`)
};

const es_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esquemas de color claro y oscuro disponibles. La preferencia se guarda localmente en el dispositivo y no se envía al servidor.`)
};

const en_xa2_demo_narrative_settings_appearance_body = /** @type {(inputs: Demo_Narrative_Settings_Appearance_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìght ànd dàrk còlòr schèmès àrè àvàìlàblè. Thè prèfèrèncè ìs sàvèd lòcàlly òn thè dèvìcè ànd ìs nòt sènt tò thè sèrvèr. ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Light and dark color schemes are available. The preference is saved locally on the device and is not sent to the server." |
*
* @param {Demo_Narrative_Settings_Appearance_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_appearance_body = /** @type {((inputs?: Demo_Narrative_Settings_Appearance_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Appearance_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_appearance_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_appearance_body(inputs)
	return en_demo_narrative_settings_appearance_body(inputs)
});