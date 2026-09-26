/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Media_Images_BodyInputs */

const en_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An image a client sends by picture message is validated, sealed with the ticket key, and stored as ciphertext. The browser decrypts the image before displaying its thumbnail. [[#client-data #encryption]]
**Validation.** Each image is fetched from the provider independently, and one that fails does not stop the others. An image is refused when it meets any of these conditions:
- Over five megabytes
- A content type outside the allowed list
- Leading bytes that do not match the declared type
The last condition prevents a file renamed to pass as a picture from reaching the ticket. [[#failure-states #server-holds]]
**What does the server hold?** The size, the declared type, and the timestamps on the row are plaintext. The sealed filename is stored beside them. A database dump reveals that a ticket received a two-megabyte image on a given day. It cannot reveal the picture itself. [Timeline view](#ticket-detail/timeline) covers how that same row answers whether a follow-up carries an image. [[#metadata #server-holds]]
**What does viewing do?** The browser fetches the ciphertext, decrypts it, and holds the result as a local object reference scoped to the document. The browser does not write the decrypted picture back to storage, and the reference is released when the follow-up leaves the view. Opening the full-size view reuses the bytes already decrypted rather than fetching again. [[#privacy #client-data]]
**Retention.** The organization's media retention setting removes images from the ticket. Its purge setting deletes the bytes from storage on a separate, later date. [Data retention](#deep-dive/data-retention) covers both settings, and [File attachments](#ticket-detail/files) covers the envelope the bytes are sealed in. [[#retention]]
**The ingest handler and the thumbnail component.** \`packages/server/src/telephony/inbound-mms.ts\` downloads and validates each attachment. \`attachment-validator.ts\` holds the size, type, and magic-byte checks. The row is \`028_create_attachments.ts\`. The thumbnail is \`MmsImage.svelte\`. It receives its decrypt callback from the caller, so the ticket thread and the client's own thread render from one component. [[#client-data]]`)
};

const es_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una imagen que un cliente envía por mensaje con foto se valida, se sella con la clave del ticket y se almacena como texto cifrado. El navegador descifra la imagen antes de mostrar su miniatura. [[#client-data #encryption]]
**Validación.** Cada imagen se descarga del proveedor de forma independiente, y una que falla no detiene a las demás. Una imagen se rechaza cuando cumple cualquiera de estas condiciones:
- Supera los cinco megabytes
- Un tipo de contenido fuera de la lista permitida
- Los bytes iniciales no coinciden con el tipo declarado
La última condición impide que un archivo renombrado para aparentar ser una imagen llegue al ticket. [[#failure-states #server-holds]]
**¿Qué almacena el servidor?** El tamaño, el tipo declarado y las marcas de tiempo de la fila son texto plano. El nombre de archivo sellado se almacena junto a ellos. Un volcado de base de datos revela que un ticket recibió una imagen de dos megabytes en un día determinado. No puede revelar la imagen en sí. [Vista de línea de tiempo](#ticket-detail/timeline) trata cómo esa misma fila indica si un seguimiento lleva una imagen. [[#metadata #server-holds]]
**¿Qué ocurre al visualizar?** El navegador descarga el texto cifrado, lo descifra y mantiene el resultado como una referencia de objeto local con alcance limitado al documento. El navegador no escribe la imagen descifrada de vuelta al almacenamiento, y la referencia se libera cuando el seguimiento sale de la vista. Abrir la vista a tamaño completo reutiliza los bytes ya descifrados en lugar de descargar de nuevo. [[#privacy #client-data]]
**Retención.** La configuración de retención de medios de la organización elimina las imágenes del ticket. La configuración de purga borra los bytes del almacenamiento en una fecha separada y posterior. [Retención de datos](#deep-dive/data-retention) trata ambas configuraciones, y [Archivos adjuntos](#ticket-detail/files) trata el sobre en el que se sellan los bytes. [[#retention]]
**El controlador de ingesta y el componente de miniatura.** \`packages/server/src/telephony/inbound-mms.ts\` descarga y valida cada adjunto. \`attachment-validator.ts\` contiene las verificaciones de tamaño, tipo y bytes mágicos. La fila es \`028_create_attachments.ts\`. La miniatura es \`MmsImage.svelte\`. Recibe su función de descifrado del componente que lo invoca, de modo que el hilo del ticket y el hilo propio del cliente renderizan desde un mismo componente. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn ìmàgè à clìènt sènds by pìctùrè mèssàgè ìs vàlìdàtèd, sèàlèd wìth thè tìckèt kèy, ànd stòrèd às cìphèrtèxt. Thè bròwsèr dècrypts thè ìmàgè bèfòrè dìsplàyìng ìts thùmbnàìl. [[#clìènt-dàtà #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Vàlìdàtìòn. ••••** Èàch ìmàgè ìs fètchèd fròm thè pròvìdèr ìndèpèndèntly, ànd ònè thàt fàìls dòès nòt stòp thè òthèrs. Àn ìmàgè ìs rèfùsèd whèn ìt mèèts àny òf thèsè còndìtìòns:
- Òvèr fìvè mègàbytès
- À còntènt typè òùtsìdè thè àllòwèd lìst
- Lèàdìng bytès thàt dò nòt màtch thè dèclàrèd typè
Thè làst còndìtìòn prèvènts à fìlè rènàmèd tò pàss às à pìctùrè fròm rèàchìng thè tìckèt. [[#fàìlùrè-stàtès #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr hòld? ••••••••** Thè sìzè, thè dèclàrèd typè, ànd thè tìmèstàmps òn thè ròw àrè plàìntèxt. Thè sèàlèd fìlènàmè ìs stòrèd bèsìdè thèm. À dàtàbàsè dùmp rèvèàls thàt à tìckèt rècèìvèd à twò-mègàbytè ìmàgè òn à gìvèn dày. Ìt cànnòt rèvèàl thè pìctùrè ìtsèlf. [Tìmèlìnè vìèw](#tìckèt-dètàìl/tìmèlìnè) còvèrs hòw thàt sàmè ròw ànswèrs whèthèr à fòllòw-ùp càrrìès àn ìmàgè. [[#mètàdàtà #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès vìèwìng dò? •••••••** Thè bròwsèr fètchès thè cìphèrtèxt, dècrypts ìt, ànd hòlds thè rèsùlt às à lòcàl òbjèct rèfèrèncè scòpèd tò thè dòcùmènt. Thè bròwsèr dòès nòt wrìtè thè dècryptèd pìctùrè bàck tò stòràgè, ànd thè rèfèrèncè ìs rèlèàsèd whèn thè fòllòw-ùp lèàvès thè vìèw. Òpènìng thè fùll-sìzè vìèw rèùsès thè bytès àlrèàdy dècryptèd ràthèr thàn fètchìng àgàìn. [[#prìvàcy #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rètèntìòn. •••** Thè òrgànìzàtìòn's mèdìà rètèntìòn sèttìng rèmòvès ìmàgès fròm thè tìckèt. Ìts pùrgè sèttìng dèlètès thè bytès fròm stòràgè òn à sèpàràtè, làtèr dàtè. [Dàtà rètèntìòn](#dèèp-dìvè/dàtà-rètèntìòn) còvèrs bòth sèttìngs, ànd [Fìlè àttàchmènts](#tìckèt-dètàìl/fìlès) còvèrs thè ènvèlòpè thè bytès àrè sèàlèd ìn. [[#rètèntìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè ìngèst hàndlèr ànd thè thùmbnàìl còmpònènt. •••••••••••••••** \`pàckàgès/sèrvèr/src/tèlèphòny/ìnbòùnd-mms.ts\` dòwnlòàds ànd vàlìdàtès èàch àttàchmènt. \`àttàchmènt-vàlìdàtòr.ts\` hòlds thè sìzè, typè, ànd màgìc-bytè chècks. Thè ròw ìs \`028_crèàtè_àttàchmènts.ts\`. Thè thùmbnàìl ìs \`MmsÌmàgè.svèltè\`. Ìt rècèìvès ìts dècrypt càllbàck fròm thè càllèr, sò thè tìckèt thrèàd ànd thè clìènt's òwn thrèàd rèndèr fròm ònè còmpònènt. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An image a client sends by picture message is validated, sealed with the ticket key, and stored as ciphertext. The browser decrypts the image before displayi..." |
*
* @param {Demo_Narrative_Topic_Media_Images_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_media_images_body = /** @type {((inputs?: Demo_Narrative_Topic_Media_Images_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Media_Images_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_media_images_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_media_images_body(inputs)
	return en_demo_narrative_topic_media_images_body(inputs)
});