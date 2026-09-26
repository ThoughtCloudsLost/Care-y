/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Files_BodyInputs */

const en_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A file attached to a ticket is sealed in the browser before upload. Both the bytes and the filename reach the server as ciphertext. [[#encryption #client-data]]
**What key does each file get?** Every attachment is sealed under a key of its own. That key is sealed to the ticket key and stored beside the file, so opening a file requires the ticket key and nothing the server holds on its own. The file, its key and its filename are each bound to the attachment identifier, so a file moved to another row fails to open, and a key or filename separated from its file fails the same way. The file key never reaches the page. It is unwrapped inside the crypto worker. [How encryption works](#deep-dive/how-encryption-works) covers the key tiers. [[#keys #encryption]]
**What does the server hold?** The ciphertext size, the declared content type and the times on the row. The server enforces these limits on each upload:
- Ten megabytes of ciphertext per file, with the browser holding back a kilobyte for the envelope
- Five files per follow-up
- The content type must appear on the allowed list
- The declared size must match the bytes that arrived [[#server-holds #metadata]]
**Upload before send.** A file is uploaded as soon as it is picked, so a failed send does not upload it again. A file uploaded but never sent with a follow-up is swept from storage after twenty-four hours. [[#failure-states]]
**Downloading.** The download endpoint requires the Download case media permission, returns ciphertext and decrypts nothing. The browser opens the file and its filename and hands both to the download the device performs. [The permission system](#deep-dive/the-permission-system) covers that grant. [[#permissions #privacy]]
**The upload composable and the row.** \`create-attachment-upload.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` owns the pick, the validation and the upload. \`packages/crypto/src/attachment.ts\` holds the file-key payload and its encoding. The row is \`028_create_attachments.ts\`. The sweep of unlinked uploads and the retention cleanup are both in \`packages/server/src/tickets/media-service.ts\`. [[#client-data #retention]]`)
};

const es_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un archivo adjuntado a un ticket se sella en el navegador antes de subirse. Tanto los bytes como el nombre llegan al servidor como texto cifrado. [[#encryption #client-data]]
**¿Qué clave recibe cada archivo?** Cada adjunto se sella con una clave propia. Esa clave se sella con la clave del ticket y se guarda junto al archivo, de modo que abrir un archivo requiere la clave del ticket y nada que el servidor tenga por su cuenta. El archivo, su clave y su nombre quedan ligados al identificador del adjunto, así que un archivo trasladado a otra fila no se abre, y una clave o un nombre separado de su archivo falla del mismo modo. La clave del archivo nunca llega a la página. Se desenvuelve dentro del trabajador de cifrado. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los niveles de claves. [[#keys #encryption]]
**¿Qué guarda el servidor?** El tamaño del texto cifrado, el tipo de contenido declarado y las fechas de la fila. El servidor aplica estos límites a cada subida:
- Diez megabytes de texto cifrado por archivo, de los que el navegador reserva un kilobyte para el sobre
- Cinco archivos por seguimiento
- El tipo de contenido debe figurar en la lista admitida
- El tamaño declarado debe coincidir con los bytes que llegaron [[#server-holds #metadata]]
**Subida antes del envío.** Un archivo se sube en cuanto se elige, de modo que un envío fallido no vuelve a subirlo. Un archivo subido que nunca se envía con un seguimiento se retira del almacén tras veinticuatro horas. [[#failure-states]]
**Descarga.** El extremo de descarga requiere el permiso Descargar archivos del caso, entrega texto cifrado y no descifra nada. El navegador abre el archivo y su nombre y entrega ambos a la descarga que realiza el dispositivo. [El sistema de permisos](#deep-dive/the-permission-system) trata esa concesión. [[#permissions #privacy]]
**El composable de subida y la fila.** \`create-attachment-upload.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, gestiona la elección, la validación y la subida. \`packages/crypto/src/attachment.ts\` contiene la carga de clave de archivo y su codificación. La fila es \`028_create_attachments.ts\`. El barrido de subidas sin enlazar y la limpieza por retención están ambos en \`packages/server/src/tickets/media-service.ts\`. [[#client-data #retention]]`)
};

const en_xa2_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À fìlè àttàchèd tò à tìckèt ìs sèàlèd ìn thè bròwsèr bèfòrè ùplòàd. Bòth thè bytès ànd thè fìlènàmè rèàch thè sèrvèr às cìphèrtèxt. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••**Whàt kèy dòès èàch fìlè gèt? •••••••••** Èvèry àttàchmènt ìs sèàlèd ùndèr à kèy òf ìts òwn. Thàt kèy ìs sèàlèd tò thè tìckèt kèy ànd stòrèd bèsìdè thè fìlè, sò òpènìng à fìlè rèqùìrès thè tìckèt kèy ànd nòthìng thè sèrvèr hòlds òn ìts òwn. Thè fìlè, ìts kèy ànd ìts fìlènàmè àrè èàch bòùnd tò thè àttàchmènt ìdèntìfìèr, sò à fìlè mòvèd tò ànòthèr ròw fàìls tò òpèn, ànd à kèy òr fìlènàmè sèpàràtèd fròm ìts fìlè fàìls thè sàmè wày. Thè fìlè kèy nèvèr rèàchès thè pàgè. Ìt ìs ùnwràppèd ìnsìdè thè cryptò wòrkèr. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè kèy tìèrs. [[#kèys #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr hòld? ••••••••** Thè cìphèrtèxt sìzè, thè dèclàrèd còntènt typè ànd thè tìmès òn thè ròw. Thè sèrvèr ènfòrcès thèsè lìmìts òn èàch ùplòàd:
- Tèn mègàbytès òf cìphèrtèxt pèr fìlè, wìth thè bròwsèr hòldìng bàck à kìlòbytè fòr thè ènvèlòpè
- Fìvè fìlès pèr fòllòw-ùp
- Thè còntènt typè mùst àppèàr òn thè àllòwèd lìst
- Thè dèclàrèd sìzè mùst màtch thè bytès thàt àrrìvèd [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ùplòàd bèfòrè sènd. ••••••** À fìlè ìs ùplòàdèd às sòòn às ìt ìs pìckèd, sò à fàìlèd sènd dòès nòt ùplòàd ìt àgàìn. À fìlè ùplòàdèd bùt nèvèr sènt wìth à fòllòw-ùp ìs swèpt fròm stòràgè àftèr twènty-fòùr hòùrs. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dòwnlòàdìng. ••••** Thè dòwnlòàd èndpòìnt rèqùìrès thè Dòwnlòàd càsè mèdìà pèrmìssìòn, rètùrns cìphèrtèxt ànd dècrypts nòthìng. Thè bròwsèr òpèns thè fìlè ànd ìts fìlènàmè ànd hànds bòth tò thè dòwnlòàd thè dèvìcè pèrfòrms. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs thàt grànt. [[#pèrmìssìòns #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè ùplòàd còmpòsàblè ànd thè ròw. •••••••••••** \`crèàtè-àttàchmènt-ùplòàd.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\` òwns thè pìck, thè vàlìdàtìòn ànd thè ùplòàd. \`pàckàgès/cryptò/src/àttàchmènt.ts\` hòlds thè fìlè-kèy pàylòàd ànd ìts èncòdìng. Thè ròw ìs \`028_crèàtè_àttàchmènts.ts\`. Thè swèèp òf ùnlìnkèd ùplòàds ànd thè rètèntìòn clèànùp àrè bòth ìn \`pàckàgès/sèrvèr/src/tìckèts/mèdìà-sèrvìcè.ts\`. [[#clìènt-dàtà #rètèntìòn]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A file attached to a ticket is sealed in the browser before upload. Both the bytes and the filename reach the server as ciphertext. [[#encryption #client-dat..." |
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