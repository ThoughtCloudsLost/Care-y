/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Security_BodyInputs */

const en_demo_narrative_settings_security_body = /** @type {(inputs: Demo_Narrative_Settings_Security_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two entries sit under the security heading beside two factor enrollment.
**Review security briefing** opens the briefing from the login walkthrough. It explains what CARE-Y protects, how the encryption works at a high level, and what risks remain outside the system's control.
**Review security walkthrough** will replay the interactive walkthrough itself and is not available yet.`)
};

const es_demo_narrative_settings_security_body = /** @type {(inputs: Demo_Narrative_Settings_Security_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dos entradas se encuentran bajo el encabezado de seguridad junto al registro de segundo factor.
**Revisar resumen de seguridad** abre el resumen del recorrido de inicio de sesión. Explica qué protege CARE-Y, cómo funciona el cifrado a alto nivel y qué riesgos quedan fuera del control del sistema.
**Revisar guía de seguridad** reproducirá el recorrido interactivo y aún no está disponible.`)
};

/**
* | output |
* | --- |
* | "Two entries sit under the security heading beside two factor enrollment. **Review security briefing** opens the briefing from the login walkthrough. It expla..." |
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