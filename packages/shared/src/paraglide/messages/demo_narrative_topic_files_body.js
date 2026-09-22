/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Files_BodyInputs */

const en_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A file attached to a case is sealed in the browser before it is uploaded, and both the bytes and the filename reach the server already closed. [[#encryption #client-data]]
**The key each file gets.** Every attachment is sealed under a key of its own, and that key is sealed to the case key and stored beside the file, so opening a file takes the case key and nothing the server holds on its own. The file, its key and its filename are each bound to the attachment's identifier, so any of the three moved to another row fails to open rather than opening in the wrong case. The file key never reaches the page: it is unwrapped inside the crypto worker. [How encryption works](#deep-dive/how-encryption-works) covers the key tiers, and [Attaching a file to a reply](#ticket-detail/compose-actions) covers what the compose path offers. [[#keys #encryption]]
**What the server can measure.** The ciphertext's size, the declared content type and the times on the row, and nothing else. Uploads are capped at ten megabytes of ciphertext with the browser holding back a kilobyte of that for the envelope, five files ride on one message, and the type must be one the allowed list names. Those are the only checks a server holding ciphertext can make. [[#server-holds #metadata]]
**Uploading before sending.** A file is uploaded as soon as it is picked, so a send that fails does not upload it again, and a file uploaded but never sent with a message is swept out of storage a day later. [[#failure-states]]
**Downloading one.** The download endpoint checks permission to download case media, hands back ciphertext and decrypts nothing, and the browser opens the file and the filename and hands both to the download the device performs. [The permission system](#deep-dive/the-permission-system) covers that grant. [[#permissions #privacy]]
**The upload composable and the row.** \`create-attachment-upload.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` owns the pick, the caps and the upload, \`packages/crypto/src/attachment.ts\` holds the file-key envelope and its slots, and the row is \`028_create_attachments.ts\`. The sweep of unsent uploads and the retention cleanup are both in \`packages/server/src/tickets/media-service.ts\`. [[#client-data #retention]]`)
};

const es_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un archivo adjuntado a un caso se sella en el navegador antes de subirse, y tanto los bytes como el nombre llegan al servidor ya cerrados. [[#encryption #client-data]]
**La clave que recibe cada archivo.** Cada adjunto se sella con una clave propia, y esa clave se sella con la clave del caso y se guarda junto al archivo, de modo que abrir un archivo requiere la clave del caso y nada que el servidor tenga por su cuenta. El archivo, su clave y su nombre quedan ligados al identificador del adjunto, así que cualquiera de los tres trasladado a otra fila no se abre en lugar de abrirse en el caso equivocado. La clave del archivo nunca llega a la página: se desenvuelve dentro del trabajador de cifrado. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los niveles de claves, y [Adjuntar un archivo a una respuesta](#ticket-detail/compose-actions) trata lo que ofrece el camino de redacción. [[#keys #encryption]]
**Lo que el servidor puede medir.** El tamaño del texto cifrado, el tipo de contenido declarado y las fechas de la fila, y nada más. Las subidas tienen un tope de diez megabytes de texto cifrado, del que el navegador reserva un kilobyte para el sobre, cinco archivos viajan con un mensaje, y el tipo debe ser uno de los que nombra la lista admitida. Esas son las únicas comprobaciones que puede hacer un servidor que guarda texto cifrado. [[#server-holds #metadata]]
**Subir antes de enviar.** Un archivo se sube en cuanto se elige, de modo que un envío fallido no vuelve a subirlo, y un archivo subido que nunca se envía con un mensaje se retira del almacén un día después. [[#failure-states]]
**Descargar uno.** El extremo de descarga comprueba el permiso de descarga de archivos del caso, entrega texto cifrado y no descifra nada, y el navegador abre el archivo y su nombre y entrega ambos a la descarga que realiza el dispositivo. [El sistema de permisos](#deep-dive/the-permission-system) trata esa concesión. [[#permissions #privacy]]
**El componente de subida y la fila.** \`create-attachment-upload.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, gestiona la elección, los topes y la subida; \`packages/crypto/src/attachment.ts\` contiene el sobre de clave de archivo y sus ranuras, y la fila es \`028_create_attachments.ts\`. El barrido de subidas sin enviar y la limpieza por retención están ambos en \`packages/server/src/tickets/media-service.ts\`. [[#client-data #retention]]`)
};

const en_xa2_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèrs càn àttàch fìlès tò à tìckèt, ànd èàch fìlè ìs èncryptèd wìth thè pèr tìckèt kèy bèfòrè ùplòàd sò thè sèrvèr stòrès ònly cìphèrtèxt àlòng wìth thè èncryptèd fìlènàmè. Dòwnlòàdìng à fìlè dècrypts ìt òn thè dèvìcè, whìch mèàns thè sèrvèr dèlìvèrs ònly cìphèrtèxt ànd nèvèr sèès thè fìlè còntènts. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A file attached to a case is sealed in the browser before it is uploaded, and both the bytes and the filename reach the server already closed. [[#encryption ..." |
*
* @param {Demo_Narrative_Topic_Files_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_files_body = /** @type {((inputs?: Demo_Narrative_Topic_Files_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Files_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_files_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_files_body(inputs)
	return en_demo_narrative_topic_files_body(inputs)
});