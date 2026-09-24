/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Media_Images_BodyInputs */

const en_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An image a client sends by picture message is checked, sealed with the case key and stored as ciphertext, and the thumbnail in the thread is drawn from bytes the browser opened. [[#client-data #encryption]]
**What is checked before anything is stored.** Each image is fetched from the provider on its own, and one that fails does not stop the others. An image over five megabytes, of a type outside the allowed list, or whose leading bytes do not match the type it declares is refused and recorded with the reason, so a file renamed to pass as a picture does not reach the case. [[#failure-states #server-holds]]
**What the server knows about a picture.** Its size, its declared type and the times on its row, all plaintext, and the sealed filename beside them. A database dump shows that a case received a two-megabyte image on a given day, and cannot show the picture. [The timeline](#ticket-detail/timeline) covers how that same row answers whether an entry carries an image. [[#metadata #server-holds]]
**What viewing one does.** The browser fetches the ciphertext, opens it, and holds the result as a local reference that is released when the entry leaves the view, so the decrypted picture is not written back and reaches nothing outside the tab. Opening the full-size view reuses the bytes already opened rather than fetching again. [[#privacy #client-data]]
**How long a picture stays.** Images are removed from the case on the organization's media retention setting and their bytes are deleted from storage on its purge setting, which is a second, later date. [Data retention](#deep-dive/data-retention) covers both settings, and [Attachments](#ticket-detail/files) covers the envelope the bytes are sealed in. [[#retention]]
**The ingest path and the thumbnail.** \`packages/server/src/telephony/inbound-mms.ts\` downloads and validates, \`attachment-validator.ts\` holds the size, type and signature checks, and the row is \`028_create_attachments.ts\`. The thumbnail is \`MmsImage.svelte\`, which takes its decrypt from the caller so the case thread and the client's own thread render from one component. [[#client-data]]`)
};

const es_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una imagen que un cliente envía por mensaje multimedia se comprueba, se sella con la clave del caso y se guarda como texto cifrado, y la miniatura del hilo se dibuja con bytes que abrió el navegador. [[#client-data #encryption]]
**Lo que se comprueba antes de guardar nada.** Cada imagen se recoge del proveedor por separado, y una que falla no detiene a las demás. Una imagen de más de cinco megabytes, de un tipo fuera de la lista admitida, o cuyos primeros bytes no coinciden con el tipo que declara, se rechaza y se registra con el motivo, de modo que un archivo renombrado para pasar por una foto no llega al caso. [[#failure-states #server-holds]]
**Lo que el servidor sabe de una imagen.** Su tamaño, su tipo declarado y las fechas de su fila, todo en texto plano, y el nombre de archivo sellado junto a ellos. Un volcado de la base de datos muestra que un caso recibió una imagen de dos megabytes cierto día, y no puede mostrar la imagen. [La línea de tiempo](#ticket-detail/timeline) trata cómo esa misma fila responde si una entrada lleva una imagen. [[#metadata #server-holds]]
**Lo que ocurre al verla.** El navegador recoge el texto cifrado, lo abre y guarda el resultado como una referencia local que se libera cuando la entrada sale de la vista, así que la imagen descifrada no se escribe de vuelta ni se entrega a nada fuera de la pestaña. Abrir la vista a tamaño completo reutiliza los bytes ya abiertos en lugar de volver a pedirlos. [[#privacy #client-data]]
**Cuánto tiempo permanece una imagen.** Las imágenes se retiran del caso según el ajuste de retención de archivos de la organización, y sus bytes se borran del almacén según su ajuste de purga, que es una segunda fecha posterior. [Retención de datos](#deep-dive/data-retention) trata ambos ajustes, y [Adjuntos](#ticket-detail/files) trata el sobre en el que se sellan los bytes. [[#retention]]
**El camino de entrada y la miniatura.** \`packages/server/src/telephony/inbound-mms.ts\` descarga y valida, \`attachment-validator.ts\` contiene las comprobaciones de tamaño, tipo y firma, y la fila es \`028_create_attachments.ts\`. La miniatura es \`MmsImage.svelte\`, que recibe su función de descifrado de quien la usa, de modo que el hilo del caso y el hilo propio del cliente se dibujan desde un solo componente. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phòtòs thàt clìènts tèxt ìn òvèr MMS àrè stòrèd às èncryptèd bìnàry òn thè sèrvèr ànd dècryptèd ìn thè bròwsèr bèfòrè à thùmbnàìl àppèàrs ìn thè thrèàd. Tàppìng thè thùmbnàìl òpèns à fùll scrèèn vìèwèr thàt rèndèrs thè ìmàgè àt ìts òrìgìnàl rèsòlùtìòn whìlè thè dècryptèd bytès stày ìn mèmòry òn thè dèvìcè ànd àrè nèvèr wrìttèn bàck tò thè sèrvèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An image a client sends by picture message is checked, sealed with the case key and stored as ciphertext, and the thumbnail in the thread is drawn from bytes..." |
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