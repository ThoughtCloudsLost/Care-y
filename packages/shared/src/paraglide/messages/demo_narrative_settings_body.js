/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_BodyInputs */

const en_demo_narrative_settings_body = /** @type {(inputs: Demo_Narrative_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Settings lets you change your display name, password, locale, and notification options. Changes are encrypted before leaving your device. The server stores the update as ciphertext without reading it.`)
};

const es_demo_narrative_settings_body = /** @type {(inputs: Demo_Narrative_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuracion te permite cambiar tu nombre visible, contrasena, idioma y opciones de notificacion. Los cambios se cifran antes de salir de tu dispositivo. El servidor almacena la actualizacion como texto cifrado sin leerla.`)
};

/**
* | output |
* | --- |
* | "Settings lets you change your display name, password, locale, and notification options. Changes are encrypted before leaving your device. The server stores t..." |
*
* @param {Demo_Narrative_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_body = /** @type {((inputs?: Demo_Narrative_Settings_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_body(inputs)
	return es_demo_narrative_settings_body(inputs)
});