/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Secure_Link_BodyInputs */

const en_demo_narrative_topic_secure_link_body = /** @type {(inputs: Demo_Narrative_Topic_Secure_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The secure link sheet walks through a six step flow to generate a URL that gives the client browser access to the ticket thread.
**Passphrase toggle.** The first screen offers an optional passphrase. When enabled, the sheet generates diceware words that the volunteer shares with the client through a separate channel. The passphrase and the finished link are never shown in the same step.
**Generation.** The browser generates a random seed, derives channel keys from it, and sends only a hash and a public key to the server. The seed itself never leaves the device.
**Link ready.** The finished link appears in a copyable block. The volunteer can copy it to the clipboard or send it by SMS through the organization's phone line. After the sheet closes, the browser zeros all seed material from memory.
**Argon2id wait.** When a passphrase is enabled, a progress indicator shows while the browser runs Argon2id over the passphrase. This step is intentionally slow and is the same strengthening function used for volunteer passwords.`)
};

const es_demo_narrative_topic_secure_link_body = /** @type {(inputs: Demo_Narrative_Topic_Secure_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La hoja de enlace seguro guía a través de un flujo de seis pasos para generar una URL que da al cliente acceso desde el navegador al hilo del ticket.
**Activar frase de paso.** La primera pantalla ofrece una frase de paso opcional. Cuando está habilitada, la hoja genera palabras diceware que el voluntario comparte con el cliente a través de un canal separado. La frase de paso y el enlace terminado nunca se muestran en el mismo paso.
**Generación.** El navegador genera una semilla aleatoria, deriva claves de canal a partir de ella, y envía solo un hash y una clave pública al servidor. La semilla nunca sale del dispositivo.
**Enlace listo.** El enlace terminado aparece en un bloque que se puede copiar. El voluntario puede copiarlo al portapapeles o enviarlo por SMS a través de la línea telefónica de la organización. Después de cerrar la hoja, el navegador elimina de memoria todo el material de semilla.
**Espera de Argon2id.** Cuando hay una frase de paso habilitada, un indicador de progreso muestra mientras el navegador ejecuta Argon2id sobre la frase de paso. Este paso es intencionalmente lento y es la misma función de refuerzo usada para las contraseñas de voluntarios.`)
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
* | "The secure link sheet walks through a six step flow to generate a URL that gives the client browser access to the ticket thread. **Passphrase toggle.** The f..." |
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