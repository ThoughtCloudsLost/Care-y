/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Security_BodyInputs */

const en_demo_narrative_settings_security_body = /** @type {(inputs: Demo_Narrative_Settings_Security_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can review the security briefing from the login walkthrough at any time from this page. The briefing explains what CARE-Y protects, how the encryption works at a high level, and what risks remain outside the system's control.`)
};

const es_demo_narrative_settings_security_body = /** @type {(inputs: Demo_Narrative_Settings_Security_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden revisar la charla de seguridad del recorrido inicial de inicio de sesion en cualquier momento desde esta pagina. La charla explica que protege CARE-Y, como funciona el cifrado a alto nivel y que riesgos quedan fuera del control del sistema.`)
};

/**
* | output |
* | --- |
* | "Volunteers can review the security briefing from the login walkthrough at any time from this page. The briefing explains what CARE-Y protects, how the encryp..." |
*
* @param {Demo_Narrative_Settings_Security_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_security_body = /** @type {((inputs?: Demo_Narrative_Settings_Security_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Security_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_security_body(inputs)
	return es_demo_narrative_settings_security_body(inputs)
});