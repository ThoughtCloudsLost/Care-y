/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Email_BodyInputs */

const en_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six-digit code is sent to the address recorded on the account. It is good for five minutes, and a third wrong entry deletes it rather than locking the account, so the next attempt starts from a fresh code. [[#failure-states #privacy]]
**Why the address is readable to the server.** The address is held under the server's own operational encryption rather than the organization's end-to-end encryption, because a server that cannot read an address cannot send anything to it. This is a deliberate exception to the rule that the server holds only ciphertext it cannot open, and it is confined to the delivery addresses the server has to act on. [The trust boundary](#deep-dive/the-trust-boundary) covers the rest of that line. [[#trust-boundary #server-holds]]
**How often a code can be asked for.** One code per minute per account, and five in an hour. Beyond either limit the request is refused with the time to wait, which keeps a stolen password from being used to bury someone under sign-in codes. [[#failure-states]]
**What this method is worth.** The account is as reachable as the mailbox it points at. Anyone who can read that mailbox can complete a sign-in with a password they already have, so this method suits an account whose mailbox is itself protected by something stronger. [[#privacy #trust-boundary]]
**The code service and its row.** Generation, hashing, expiry and attempt counting are in \`packages/server/src/auth/email-code.ts\`, and the row is \`packages/server/src/db/migrations/tenant/008_create_email_codes.ts\`. The stored address is \`users.encrypted_notification_addr\` from \`packages/server/src/db/migrations/tenant/001_create_users.ts\`, read back through the field encryptor in \`packages/server/src/auth/two-factor-service.ts\`. [[#server-holds]]`)
};

const es_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envía un código de seis dígitos a la dirección registrada en la cuenta. Vale durante cinco minutos, y una tercera entrada incorrecta lo elimina en lugar de bloquear la cuenta, de modo que el intento siguiente parte de un código nuevo. [[#failure-states #privacy]]
**Por qué el servidor puede leer la dirección.** La dirección se guarda bajo el cifrado operativo del propio servidor y no bajo el cifrado de extremo a extremo de la organización, porque un servidor que no puede leer una dirección no puede enviarle nada. Es una excepción deliberada a la regla de que el servidor solo guarda texto cifrado que no puede abrir, y se limita a las direcciones de entrega con las que el servidor tiene que operar. [La frontera de confianza](#deep-dive/the-trust-boundary) trata el resto de esa línea. [[#trust-boundary #server-holds]]
**Con qué frecuencia se puede pedir un código.** Un código por minuto y por cuenta, y cinco en una hora. Superado cualquiera de los dos límites, la petición se rechaza indicando cuánto hay que esperar, lo que impide que una contraseña robada sirva para sepultar a alguien bajo códigos de acceso. [[#failure-states]]
**Cuánto protege este método.** La cuenta es tan alcanzable como el buzón al que apunta. Quien pueda leer ese buzón puede completar un inicio de sesión con una contraseña que ya tenga, así que este método encaja en una cuenta cuyo buzón esté a su vez protegido por algo más fuerte. [[#privacy #trust-boundary]]
**El servicio de códigos y su fila.** La generación, el hash, la caducidad y el recuento de intentos están en \`packages/server/src/auth/email-code.ts\`, y la fila es \`packages/server/src/db/migrations/tenant/008_create_email_codes.ts\`. La dirección almacenada es \`users.encrypted_notification_addr\`, de \`packages/server/src/db/migrations/tenant/001_create_users.ts\`, y se lee mediante el cifrador de campos en \`packages/server/src/auth/two-factor-service.ts\`. [[#server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À sìx-dìgìt còdè ìs sènt tò thè èmàìl àddrèss òn fìlè. Ìt èxpìrès àftèr fìvè mìnùtès ànd ìs dèlètèd àftèr thrèè ìncòrrèct àttèmpts.
 ••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Thè èmàìl àddrèss ìs stòrèd ùndèr thè sèrvèr's òpèràtìònàl èncryptìòn ràthèr thàn ènd-tò-ènd èncryptìòn. Thìs ìs à dèlìbèràtè èxcèptìòn: thè sèrvèr mùst bè àblè tò rèàd thè àddrèss tò sènd thè còdè.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sècùrìty tràdèòff. ••••••** Thè sècùrìty òf thìs mèthòd màtchès thè sècùrìty òf thè màìlbòx. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A six-digit code is sent to the address recorded on the account. It is good for five minutes, and a third wrong entry deletes it rather than locking the acco..." |
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