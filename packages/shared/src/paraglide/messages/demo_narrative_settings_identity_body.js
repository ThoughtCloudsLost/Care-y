/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Identity_BodyInputs */

const en_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`**Display name.** The display name is encrypted with the organization key in the browser before being sent to the server.
**Username.** The username is sent to the server in plaintext (protected by TLS in transit) because it is used for authentication lookup, and the server re-encrypts it on receipt.`)
};

const es_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`**Nombre visible.** El nombre visible se cifra con la clave de la organización en el navegador antes de enviarse al servidor.
**Nombre de usuario.** El nombre de usuario se envía al servidor en texto plano (protegido por TLS en tránsito) porque se usa para la búsqueda de autenticación, y el servidor lo recifra al recibirlo.`)
};

const en_xa2_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦**Dìsplày nàmè. ••••** Thè dìsplày nàmè ìs èncryptèd wìth thè òrgànìzàtìòn kèy ìn thè bròwsèr bèfòrè bèìng sènt tò thè sèrvèr.
 ••••••••••••••••••••••••••••••••**Ùsèrnàmè. •••** Thè ùsèrnàmè ìs sènt tò thè sèrvèr ìn plàìntèxt (pròtèctèd by TLS ìn trànsìt) bècàùsè ìt ìs ùsèd fòr àùthèntìcàtìòn lòòkùp, ànd thè sèrvèr rè-èncrypts ìt òn rècèìpt. ••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "**Display name.** The display name is encrypted with the organization key in the browser before being sent to the server. **Username.** The username is sent ..." |
*
* @param {Demo_Narrative_Settings_Identity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_identity_body = /** @type {((inputs?: Demo_Narrative_Settings_Identity_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Identity_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_identity_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_identity_body(inputs)
	return en_demo_narrative_settings_identity_body(inputs)
});