/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Secure_Link_BodyInputs */

const en_demo_narrative_topic_secure_link_body = /** @type {(inputs: Demo_Narrative_Topic_Secure_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Setting up a secure link mints a private page for one client, reachable only by the exact address the user hands over. [[#portal #keys]]
**What the browser makes and what the server receives.** The browser draws a 24-byte random seed and derives from it the channel identifier, a bearer token that authenticates every call the client's page makes, and a salt. The seed, or the seed folded together with the Argon2id stretch of a spoken passphrase, goes through a key evaluation round and the result derives the client's keypair. What the server is given is the channel identifier, a hash of the bearer token, the client's public key and a small ciphertext the page later uses to tell a right passphrase from a wrong one. The seed stays in the part of the address after the \`#\`, which browsers never send. [How keys are derived](#deep-dive/how-keys-are-derived) covers the evaluation round. [[#keys #encryption #server-holds]]
**The passphrase.** Five words drawn from the EFF word list, sampled without modulo bias, meant to be spoken on a call and written down nowhere. The words and the finished address are never on screen in the same step, so a photograph of either one is not the other. A client who retypes the words with different casing, spacing or unicode form derives the same key, because the phrase is normalized before it is stretched. [[#keys #privacy #portal]]
**Handing it over, and the older messages.** The address can be copied or sent as a text through the organization's own line, which is rate limited and reports how long to wait. Setup also offers to re-seal the conversation so far under the new channel key, which walks every case belonging to that client in chunks and reports how many items it could not convert. Closing the sheet zeroes the seed, the bearer token and the private key, and cancelling mid-run asks first. [[#portal #failure-states #telephony]]
**Where the derivation lives.** \`packages/crypto/src/portal.ts\` holds the seed, channel, salt and keypair derivations with their references; the sheet is \`SecureLinkSheet.svelte\` and the re-seal walk is \`create-portal-reseed.svelte.ts\` in \`packages/client/src/lib/composables/tickets/\`. A failed mutation returns the sheet to its first step and shows one generic message, because the error object in scope can carry key material. [Portal and channel lifecycle](#deep-dive/portal-channel-lifecycle) covers the row the mutation writes. [[#keys #failure-states]]`)
};

const es_demo_narrative_topic_secure_link_body = /** @type {(inputs: Demo_Narrative_Topic_Secure_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar un enlace seguro crea una página privada para un solo cliente, accesible únicamente con la dirección exacta que la persona usuaria le entrega. [[#portal #keys]]
**Lo que hace el navegador y lo que recibe el servidor.** El navegador saca una semilla aleatoria de 24 bytes y deriva de ella el identificador del canal, un token portador que autentica cada llamada que hace la página del cliente, y una sal. La semilla, o la semilla unida al refuerzo Argon2id de una frase de paso dicha en voz alta, pasa por una ronda de evaluación de claves y el resultado deriva el par de claves del cliente. Lo que se le entrega al servidor es el identificador del canal, un hash del token portador, la clave pública del cliente y un pequeño texto cifrado que la página usa después para distinguir una frase de paso correcta de una equivocada. La semilla se queda en la parte de la dirección posterior al \`#\`, que los navegadores nunca envían. [Cómo se derivan las claves](#deep-dive/how-keys-are-derived) trata la ronda de evaluación. [[#keys #encryption #server-holds]]
**La frase de paso.** Cinco palabras tomadas de la lista de la EFF, muestreadas sin sesgo de módulo, pensadas para decirse en una llamada y no anotarse en ninguna parte. Las palabras y la dirección terminada nunca están en pantalla en el mismo paso, así que una fotografía de una no es la otra. Un cliente que reescribe las palabras con otras mayúsculas, otros espacios o otra forma unicode deriva la misma clave, porque la frase se normaliza antes de reforzarse. [[#keys #privacy #portal]]
**La entrega y los mensajes anteriores.** La dirección se puede copiar o enviar como mensaje de texto por la línea de la propia organización, que tiene límite de frecuencia e indica cuánto hay que esperar. La configuración ofrece además volver a sellar la conversación previa con la nueva clave del canal, lo que recorre por tramos todos los casos de ese cliente e informa de cuántos elementos no pudo convertir. Cerrar la hoja borra de memoria la semilla, el token portador y la clave privada, y cancelar a mitad de la conversión pregunta antes. [[#portal #failure-states #telephony]]
**Dónde vive la derivación.** \`packages/crypto/src/portal.ts\` contiene las derivaciones de la semilla, el canal, la sal y el par de claves con sus referencias; la hoja es \`SecureLinkSheet.svelte\` y el recorrido de resellado es \`create-portal-reseed.svelte.ts\`, en \`packages/client/src/lib/composables/tickets/\`. Una mutación fallida devuelve la hoja a su primer paso y muestra un único mensaje genérico, porque el objeto de error que hay en ese ámbito puede llevar material de claves. [Portal y ciclo de vida del canal](#deep-dive/portal-channel-lifecycle) trata la fila que escribe la mutación. [[#keys #failure-states]]`)
};

const en_xa2_demo_narrative_topic_secure_link_body = /** @type {(inputs: Demo_Narrative_Topic_Secure_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sècùrè lìnk shèèt wàlks thròùgh à sìx stèp flòw tò gènèràtè à ÙRL thàt gìvès thè clìènt bròwsèr àccèss tò thè tìckèt thrèàd.
 •••••••••••••••••••••••••••••••••••••••**Pàssphràsè tògglè. ••••••** Thè fìrst scrèèn òffèrs àn òptìònàl pàssphràsè. Whèn ènàblèd, thè shèèt gènèràtès dìcèwàrè wòrds thàt thè vòlùntèèr shàrès wìth thè clìènt thròùgh à sèpàràtè chànnèl. Thè pàssphràsè ànd thè fìnìshèd lìnk àrè nèvèr shòwn ìn thè sàmè stèp.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Gènèràtìòn. ••••** Thè bròwsèr gènèràtès à ràndòm sèèd, dèrìvès chànnèl kèys fròm ìt, ànd sènds ònly à hàsh ànd à pùblìc kèy tò thè sèrvèr. Thè sèèd ìtsèlf nèvèr lèàvès thè dèvìcè.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Lìnk rèàdy. ••••** Thè fìnìshèd lìnk àppèàrs ìn à còpyàblè blòck. Thè vòlùntèèr càn còpy ìt tò thè clìpbòàrd òr sènd ìt by SMS thròùgh thè òrgànìzàtìòn's phònè lìnè. Àftèr thè shèèt clòsès, thè bròwsèr zèròs àll sèèd màtèrìàl fròm mèmòry.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àrgòn2ìd wàìt. •••••** Whèn à pàssphràsè ìs ènàblèd, à prògrèss ìndìcàtòr shòws whìlè thè bròwsèr rùns Àrgòn2ìd òvèr thè pàssphràsè. Thìs stèp ìs ìntèntìònàlly slòw ànd ìs thè sàmè strèngthènìng fùnctìòn ùsèd fòr vòlùntèèr pàsswòrds. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Setting up a secure link mints a private page for one client, reachable only by the exact address the user hands over. [[#portal #keys]] **What the browser m..." |
*
* @param {Demo_Narrative_Topic_Secure_Link_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_secure_link_body = /** @type {((inputs?: Demo_Narrative_Topic_Secure_Link_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Secure_Link_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_secure_link_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_secure_link_body(inputs)
	return en_demo_narrative_topic_secure_link_body(inputs)
});