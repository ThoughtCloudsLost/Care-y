/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Files_BodyInputs */

const en_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The browser seals a file before uploading it. Both the bytes and the filename reach the server as ciphertext. [[#encryption #client-data]]
**What key does each file get?** Each file is sealed under its own key. That key is sealed to the ticket key and stored alongside the file. Opening a file requires the ticket key, and the server cannot open it alone. The file, its key and its filename are each locked to one attachment. A file copied to a different attachment cannot be opened. A key or filename separated from its file cannot be opened either. The file key never reaches the page. It is unwrapped inside the crypto worker. [How encryption works](#deep-dive/how-encryption-works) covers the key tiers. [[#keys #encryption]]
**What does the server hold?** The ciphertext size, the declared content type and the timestamps. The server enforces these limits on each upload:
- Ten megabytes of ciphertext per file, with the browser holding back a kilobyte for the envelope
- Five files per follow-up
- The content type must appear on the allowed list
- The declared size must match the bytes that arrived [[#server-holds #metadata]]
**Upload before send.** The browser uploads a file as soon as it is picked. A failed send does not upload the file again. A file uploaded but never sent with a follow-up is swept from storage after twenty-four hours. [[#failure-states]]
**Downloading.** The download endpoint requires the Download case media permission, returns ciphertext and decrypts nothing. The browser decrypts the file and recovers its filename, then hands both to the device's own download. [The permission system](#deep-dive/the-permission-system) covers that grant. [[#permissions #privacy]]
**The upload composable and the row.** \`create-attachment-upload.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` owns the pick, the validation and the upload. \`packages/crypto/src/attachment.ts\` holds the file-key payload and its encoding. The row is \`028_create_attachments.ts\`. The sweep of unlinked uploads and the retention cleanup are both in \`packages/server/src/tickets/media-service.ts\`. [[#client-data #retention]]`)
};

const es_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El navegador sella un archivo antes de subirlo. Tanto los bytes como el nombre llegan al servidor como texto cifrado. [[#encryption #client-data]]
**¿Qué clave recibe cada archivo?** Cada adjunto se sella con una clave propia. Esa clave se sella con la clave del ticket y se guarda junto al archivo. Abrir un archivo requiere la clave del ticket, y el servidor no puede abrirlo por su cuenta. El archivo, su clave y su nombre quedan ligados a un solo adjunto. Un archivo copiado a otro adjunto no se puede abrir. Una clave o un nombre separado de su archivo tampoco se puede abrir. La clave del archivo nunca llega a la página. Se desenvuelve dentro del trabajador de cifrado. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los niveles de claves. [[#keys #encryption]]
**¿Qué guarda el servidor?** El tamaño del texto cifrado, el tipo de contenido declarado y las marcas de tiempo. El servidor aplica estos límites a cada subida:
- Diez megabytes de texto cifrado por archivo, de los que el navegador reserva un kilobyte para el sobre
- Cinco archivos por seguimiento
- El tipo de contenido debe figurar en la lista admitida
- El tamaño declarado debe coincidir con los bytes que llegaron [[#server-holds #metadata]]
**Subida antes del envío.** El navegador sube un archivo en cuanto se elige. Un envío fallido no vuelve a subir el archivo. Un archivo subido que nunca se envía con un seguimiento se retira del almacén tras veinticuatro horas. [[#failure-states]]
**Descarga.** El extremo de descarga requiere el permiso Descargar archivos del caso, entrega texto cifrado y no descifra nada. El navegador descifra el archivo y recupera su nombre, luego entrega ambos a la descarga propia del dispositivo. [El sistema de permisos](#deep-dive/the-permission-system) trata esa concesión. [[#permissions #privacy]]
**El composable de subida y la fila.** \`create-attachment-upload.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, gestiona la elección, la validación y la subida. \`packages/crypto/src/attachment.ts\` contiene la carga de clave de archivo y su codificación. La fila es \`028_create_attachments.ts\`. El barrido de subidas sin enlazar y la limpieza por retención están ambos en \`packages/server/src/tickets/media-service.ts\`. [[#client-data #retention]]`)
};

const en_xa2_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè bròwsèr sèàls à fìlè bèfòrè ùplòàdìng ìt. Bòth thè bytès ànd thè fìlènàmè rèàch thè sèrvèr às cìphèrtèxt. [[#èncryptìòn #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••**Whàt kèy dòès èàch fìlè gèt? •••••••••** Èàch fìlè ìs sèàlèd ùndèr ìts òwn kèy. Thàt kèy ìs sèàlèd tò thè tìckèt kèy ànd stòrèd àlòngsìdè thè fìlè. Òpènìng à fìlè rèqùìrès thè tìckèt kèy, ànd thè sèrvèr cànnòt òpèn ìt àlònè. Thè fìlè, ìts kèy ànd ìts fìlènàmè àrè èàch lòckèd tò ònè àttàchmènt. À fìlè còpìèd tò à dìffèrènt àttàchmènt cànnòt bè òpènèd. À kèy òr fìlènàmè sèpàràtèd fròm ìts fìlè cànnòt bè òpènèd èìthèr. Thè fìlè kèy nèvèr rèàchès thè pàgè. Ìt ìs ùnwràppèd ìnsìdè thè cryptò wòrkèr. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè kèy tìèrs. [[#kèys #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr hòld? ••••••••** Thè cìphèrtèxt sìzè, thè dèclàrèd còntènt typè ànd thè tìmèstàmps. Thè sèrvèr ènfòrcès thèsè lìmìts òn èàch ùplòàd:
- Tèn mègàbytès òf cìphèrtèxt pèr fìlè, wìth thè bròwsèr hòldìng bàck à kìlòbytè fòr thè ènvèlòpè
- Fìvè fìlès pèr fòllòw-ùp
- Thè còntènt typè mùst àppèàr òn thè àllòwèd lìst
- Thè dèclàrèd sìzè mùst màtch thè bytès thàt àrrìvèd [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ùplòàd bèfòrè sènd. ••••••** Thè bròwsèr ùplòàds à fìlè às sòòn às ìt ìs pìckèd. À fàìlèd sènd dòès nòt ùplòàd thè fìlè àgàìn. À fìlè ùplòàdèd bùt nèvèr sènt wìth à fòllòw-ùp ìs swèpt fròm stòràgè àftèr twènty-fòùr hòùrs. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dòwnlòàdìng. ••••** Thè dòwnlòàd èndpòìnt rèqùìrès thè Dòwnlòàd càsè mèdìà pèrmìssìòn, rètùrns cìphèrtèxt ànd dècrypts nòthìng. Thè bròwsèr dècrypts thè fìlè ànd rècòvèrs ìts fìlènàmè, thèn hànds bòth tò thè dèvìcè's òwn dòwnlòàd. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs thàt grànt. [[#pèrmìssìòns #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè ùplòàd còmpòsàblè ànd thè ròw. •••••••••••** \`crèàtè-àttàchmènt-ùplòàd.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\` òwns thè pìck, thè vàlìdàtìòn ànd thè ùplòàd. \`pàckàgès/cryptò/src/àttàchmènt.ts\` hòlds thè fìlè-kèy pàylòàd ànd ìts èncòdìng. Thè ròw ìs \`028_crèàtè_àttàchmènts.ts\`. Thè swèèp òf ùnlìnkèd ùplòàds ànd thè rètèntìòn clèànùp àrè bòth ìn \`pàckàgès/sèrvèr/src/tìckèts/mèdìà-sèrvìcè.ts\`. [[#clìènt-dàtà #rètèntìòn]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The browser seals a file before uploading it. Both the bytes and the filename reach the server as ciphertext. [[#encryption #client-data]] **What key does ea..." |
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