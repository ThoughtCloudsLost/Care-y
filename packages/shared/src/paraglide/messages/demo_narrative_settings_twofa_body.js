/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Twofa_BodyInputs */

const en_demo_narrative_settings_twofa_body = /** @type {(inputs: Demo_Narrative_Settings_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All supported second factor methods are enrolled from this page.
**Available methods.** Passkeys (platform authenticators and cross platform security keys), authenticator app codes (TOTP), email codes, text message codes, and push approval. Backup codes are generated automatically after the first method is enrolled.
**Enrollment flow.** Each method has its own enrollment sheet with setup instructions and verification. The simulator stands in for external devices by auto filling verification codes after a short delay, while the server side verification is real.`)
};

const es_demo_narrative_settings_twofa_body = /** @type {(inputs: Demo_Narrative_Settings_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los métodos de segundo factor admitidos se registran desde esta página.
**Métodos disponibles.** Passkeys (autenticadores de plataforma y llaves de seguridad externas), códigos de aplicación de autenticación (TOTP), códigos por correo, códigos por mensaje de texto y aprobación push. Los códigos de respaldo se generan automáticamente después de registrar el primer método.
**Flujo de registro.** Cada método tiene su propia ventana de registro con instrucciones de configuración y verificación. El simulador sustituye dispositivos externos llenando automáticamente los códigos de verificación tras una breve pausa, mientras que la verificación del lado del servidor es real.`)
};

const en_xa2_demo_narrative_settings_twofa_body = /** @type {(inputs: Demo_Narrative_Settings_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll sùppòrtèd sècònd fàctòr mèthòds àrè ènròllèd fròm thìs pàgè.
 ••••••••••••••••••••**Àvàìlàblè mèthòds. ••••••** Pàsskèys (plàtfòrm àùthèntìcàtòrs ànd cròss plàtfòrm sècùrìty kèys), àùthèntìcàtòr àpp còdès (TÒTP), èmàìl còdès, tèxt mèssàgè còdès, ànd pùsh àppròvàl. Bàckùp còdès àrè gènèràtèd àùtòmàtìcàlly àftèr thè fìrst mèthòd ìs ènròllèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ènròllmènt flòw. •••••** Èàch mèthòd hàs ìts òwn ènròllmènt shèèt wìth sètùp ìnstrùctìòns ànd vèrìfìcàtìòn. Thè sìmùlàtòr stànds ìn fòr èxtèrnàl dèvìcès by àùtò fìllìng vèrìfìcàtìòn còdès àftèr à shòrt dèlày, whìlè thè sèrvèr sìdè vèrìfìcàtìòn ìs rèàl. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "All supported second factor methods are enrolled from this page. **Available methods.** Passkeys (platform authenticators and cross platform security keys), ..." |
*
* @param {Demo_Narrative_Settings_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_twofa_body = /** @type {((inputs?: Demo_Narrative_Settings_Twofa_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Twofa_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_twofa_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_twofa_body(inputs)
	return en_demo_narrative_settings_twofa_body(inputs)
});