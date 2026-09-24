/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Portal_Thread_BodyInputs */

const en_demo_narrative_client_portal_thread_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The portal thread is a merged timeline of messages, voicemails, call entries, attachments, and contact corrections, sorted by date. The view can be narrowed by type, author, and date range.
**Encryption.** Each portal message is encrypted to the portal channel's public key. The browser derives the corresponding private key from the credential in the URL and decrypts messages in a separate background process so the page itself never holds the private key. Each attachment is encrypted under its own random key, and that key is sealed to the channel key, so the browser opens it through the same private key. Voicemail recordings decrypt through the same background process, while call entries are plaintext metadata the server stores without encryption.
**Fragment handling.** The portal page strips the credential from the address bar after reading it so it does not persist in browser history or appear if the URL is copied.`)
};

const es_demo_narrative_client_portal_thread_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El hilo del portal es una línea de tiempo unificada de mensajes, correos de voz, entradas de llamadas, archivos adjuntos y correcciones de contacto, ordenados por fecha. La vista se puede acotar por tipo, autor y rango de fechas.
**Cifrado.** Cada mensaje del portal está cifrado con la clave pública del canal. El navegador deriva la clave privada correspondiente a partir de la credencial en la URL y descifra los mensajes en un proceso en segundo plano separado para que la página nunca sostenga la clave privada. Cada archivo adjunto se cifra con su propia clave aleatoria, y esa clave se sella con la clave del canal, de modo que el navegador la abre a través de la misma clave privada. Las grabaciones de correo de voz se descifran a través del mismo proceso en segundo plano, y las entradas de llamadas son metadatos en texto plano que el servidor almacena sin cifrar.
**Manejo del fragmento.** La página del portal elimina la credencial de la barra de direcciones después de leerla para que no persista en el historial del navegador ni aparezca si se copia la URL.`)
};

const en_xa2_demo_narrative_client_portal_thread_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pòrtàl thrèàd ìs à mèrgèd tìmèlìnè òf mèssàgès, vòìcèmàìls, càll èntrìès, àttàchmènts, ànd còntàct còrrèctìòns, sòrtèd by dàtè. Thè vìèw càn bè nàrròwèd by typè, àùthòr, ànd dàtè ràngè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Èàch pòrtàl mèssàgè ìs èncryptèd tò thè pòrtàl chànnèl's pùblìc kèy. Thè bròwsèr dèrìvès thè còrrèspòndìng prìvàtè kèy fròm thè crèdèntìàl ìn thè ÙRL ànd dècrypts mèssàgès ìn à sèpàràtè bàckgròùnd pròcèss sò thè pàgè ìtsèlf nèvèr hòlds thè prìvàtè kèy. Èàch àttàchmènt ìs èncryptèd ùndèr ìts òwn ràndòm kèy, ànd thàt kèy ìs sèàlèd tò thè chànnèl kèy, sò thè bròwsèr òpèns ìt thròùgh thè sàmè prìvàtè kèy. Vòìcèmàìl rècòrdìngs dècrypt thròùgh thè sàmè bàckgròùnd pròcèss, whìlè càll èntrìès àrè plàìntèxt mètàdàtà thè sèrvèr stòrès wìthòùt èncryptìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fràgmènt hàndlìng. ••••••** Thè pòrtàl pàgè strìps thè crèdèntìàl fròm thè àddrèss bàr àftèr rèàdìng ìt sò ìt dòès nòt pèrsìst ìn bròwsèr hìstòry òr àppèàr ìf thè ÙRL ìs còpìèd. •••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The portal thread is a merged timeline of messages, voicemails, call entries, attachments, and contact corrections, sorted by date. The view can be narrowed ..." |
*
* @param {Demo_Narrative_Client_Portal_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_thread_body = /** @type {((inputs?: Demo_Narrative_Client_Portal_Thread_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Thread_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_thread_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_portal_thread_body(inputs)
	return en_demo_narrative_client_portal_thread_body(inputs)
});