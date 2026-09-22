/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Attachments_BodyInputs */

const en_demo_narrative_library_attachments_body = /** @type {(inputs: Demo_Narrative_Library_Attachments_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An article can carry images placed inside its text and files hung off it for download, and both are encrypted in the browser before upload. Images, PDFs and Word documents are accepted, at ten megabytes each. [[#encryption]]
**What the server holds for each file.** The bytes and the filename are separate pieces of organization-key ciphertext. The declared content type, the byte count, the upload time and a storage key are plaintext, so a database dump shows how many files an article carries, how large each is and roughly what kind it is, and neither their names nor anything inside them. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns across the schema. [[#server-holds #metadata]]
**What the server can and cannot check.** It checks the declared type against its list, checks the size against its limit, and checks that the declared size matches the bytes that arrived. It cannot inspect the file itself: what reaches it is ciphertext and carries no file signature, so a mislabeled file passes and becomes an image the reader's browser fails to draw. Uploads are limited to five per minute per account. [[#failure-states]]
**Reading one back.** A download takes a session and permission to view the knowledge base, which is the same key that opens the article, and the response is opaque bytes with caching refused. The browser decrypts the file and hands it to the reader, so the plaintext exists on the device and nowhere else in the path. [The permission system](#deep-dive/the-permission-system) covers where that permission comes from. [[#permissions #encryption]]
**The upload route and the blob path.** \`uploadAttachment\` in \`packages/server/src/routes/kb.ts\` writes through \`BlobStore\` under the \`kb-attachment\` category and records the row via \`packages/server/src/kb/kb-media-service.ts\`; a row insert that fails deletes the blob it wrote. Downloads run through \`createBlobDownloadHandler\` in \`packages/server/src/routes/blob-download.ts\`. An article's file list returns fifty at a time. [[#client-data]]`)
};

const es_demo_narrative_library_attachments_body = /** @type {(inputs: Demo_Narrative_Library_Attachments_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un artículo puede llevar imágenes colocadas dentro de su texto y archivos colgados de él para descargar, y ambos se cifran en el navegador antes de subirse. Se aceptan imágenes, PDF y documentos de Word, de diez megabytes cada uno. [[#encryption]]
**Lo que el servidor guarda de cada archivo.** Los bytes y el nombre del archivo son dos textos cifrados distintos con la clave de la organización. El tipo de contenido declarado, el número de bytes, la fecha de subida y una clave de almacenamiento están en texto plano, así que un volcado de la base de datos muestra cuántos archivos lleva un artículo, qué tamaño tiene cada uno y de qué clase es a grandes rasgos, y ni sus nombres ni nada de su contenido. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano de todo el esquema. [[#server-holds #metadata]]
**Lo que el servidor puede comprobar y lo que no.** Comprueba el tipo declarado contra su lista, comprueba el tamaño contra su límite y comprueba que el tamaño declarado coincida con los bytes que llegaron. No puede inspeccionar el archivo en sí: lo que le llega es texto cifrado y no lleva ninguna firma de formato, de modo que un archivo mal etiquetado pasa y se convierte en una imagen que el navegador de quien lee no consigue dibujar. Las subidas están limitadas a cinco por minuto y cuenta. [[#failure-states]]
**Recuperar uno.** Una descarga exige una sesión y permiso para ver la base de conocimiento, que es la misma llave que abre el artículo, y la respuesta son bytes opacos con el almacenamiento en caché rechazado. El navegador descifra el archivo y se lo entrega a quien lee, así que el texto en claro existe en el dispositivo y en ningún otro punto del camino. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde sale ese permiso. [[#permissions #encryption]]
**La ruta de subida y el camino del blob.** \`uploadAttachment\`, en \`packages/server/src/routes/kb.ts\`, escribe a través de \`BlobStore\` bajo la categoría \`kb-attachment\` y registra la fila mediante \`packages/server/src/kb/kb-media-service.ts\`; una inserción de fila que falla borra el blob que acaba de escribir. Las descargas pasan por \`createBlobDownloadHandler\`, en \`packages/server/src/routes/blob-download.ts\`. La lista de archivos de un artículo devuelve cincuenta cada vez. [[#client-data]]`)
};

const en_xa2_demo_narrative_library_attachments_body = /** @type {(inputs: Demo_Narrative_Library_Attachments_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àrtìclès càn hàvè fìlè àttàchmènts, bòth ìnlìnè ìmàgès ànd dòwnlòàdàblè fìlès.
 ••••••••••••••••••••••••**Èncryptìòn. ••••** Àll àttàchmènts àrè èncryptèd wìth thè òrgànìzàtìòn kèy bèfòrè stòràgè. Thè bròwsèr dòwnlòàds ànd dècrypts thèm lòcàlly.
 •••••••••••••••••••••••••••••••••••••**Àllòwèd typès. •••••** JPÈG, PNG, GÌF, WèbP, ànd PDF fìlès àrè àccèptèd. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An article can carry images placed inside its text and files hung off it for download, and both are encrypted in the browser before upload. Images, PDFs and ..." |
*
* @param {Demo_Narrative_Library_Attachments_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_attachments_body = /** @type {((inputs?: Demo_Narrative_Library_Attachments_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Attachments_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_library_attachments_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_library_attachments_body(inputs)
	return en_demo_narrative_library_attachments_body(inputs)
});