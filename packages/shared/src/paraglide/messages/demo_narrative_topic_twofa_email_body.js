/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Email_BodyInputs */

const en_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six-digit code is sent to the email address on file. It expires after five minutes and is deleted after three incorrect attempts.
**What the server holds.** The email address is stored under the server's operational encryption rather than end-to-end encryption. This is a deliberate exception: the server must be able to read the address to send the code.
**Security tradeoff.** The security of this method matches the security of the mailbox.`)
};

const es_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envía un código de seis dígitos a la dirección de correo electrónico registrada. Caduca a los cinco minutos y se elimina tras tres intentos incorrectos.
**Lo que almacena el servidor.** La dirección de correo se almacena bajo el cifrado operativo del servidor en lugar del cifrado de extremo a extremo. Es una excepción deliberada: el servidor debe poder leer la dirección para enviar el código.
**Compromiso de seguridad.** La seguridad de este método equivale a la seguridad del buzón de correo.`)
};

const en_xa2_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À sìx-dìgìt còdè ìs sènt tò thè èmàìl àddrèss òn fìlè. Ìt èxpìrès àftèr fìvè mìnùtès ànd ìs dèlètèd àftèr thrèè ìncòrrèct àttèmpts.
 ••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Thè èmàìl àddrèss ìs stòrèd ùndèr thè sèrvèr's òpèràtìònàl èncryptìòn ràthèr thàn ènd-tò-ènd èncryptìòn. Thìs ìs à dèlìbèràtè èxcèptìòn: thè sèrvèr mùst bè àblè tò rèàd thè àddrèss tò sènd thè còdè.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sècùrìty tràdèòff. ••••••** Thè sècùrìty òf thìs mèthòd màtchès thè sècùrìty òf thè màìlbòx. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A six-digit code is sent to the email address on file. It expires after five minutes and is deleted after three incorrect attempts. **What the server holds.*..." |
*
* @param {Demo_Narrative_Topic_Twofa_Email_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_email_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Email_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Email_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_email_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_email_body(inputs)
	return en_demo_narrative_topic_twofa_email_body(inputs)
});