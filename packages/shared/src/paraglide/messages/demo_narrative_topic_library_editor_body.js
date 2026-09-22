/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Editor_BodyInputs */

const en_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An article is written as a structured document with headings, lists, quotes, code, tables, links, images and figures, and the browser seals it before it leaves. Writing takes permission to edit the knowledge base. [[#permissions #encryption]]
**What is sealed and when.** Saving serializes the document, encrypts it with the organization key in the browser, and sends three separate ciphertexts: the title, the whole body, and a short excerpt derived from the document so lists and search need never fetch the body. The server stores all three as opaque bytes. A document is capped at half a megabyte before encryption, and an unsaved one exists only in the browser, since no draft is kept anywhere. [[#encryption #server-holds]]
**What a first save does in order.** A new article is created first, its images upload against the new id, and a second write replaces the body with the attachment references. An image whose upload fails leaves a reference nothing resolves and the article still saves, which is the one case where an article lands incomplete. A file that is not an image can only be attached to an article that already exists. [File attachments](#library/attachments) covers the upload itself. [[#failure-states]]
**Accessibility checks that never leave the device.** The editor walks the document for skipped heading levels, empty headings, images with no alt text and link text too generic to be useful, and it asks for alt text before an image goes in, with a mark for images that are decorative. The walk runs over the document in the browser and asks the server nothing. [[#client-data]]
**The editor stack and the save path.** The document model is the shared ProseMirror schema in \`packages/client/src/lib/editor/prosemirror-schema.ts\`, the checks are \`checkDocument\` in \`editor/atag-checks.ts\`, and the save is \`handleSave\` in \`packages/client/src/lib/components/library/ArticleEditor.svelte\` against \`createItem\` and \`updateItem\` in \`packages/server/src/routes/kb.ts\`. [The trust boundary](#deep-dive/the-trust-boundary) covers what the server holds across the schema. [[#client-data]]`)
};

const es_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un artículo se escribe como un documento estructurado con encabezados, listas, citas, código, tablas, enlaces, imágenes y figuras, y el navegador lo sella antes de que salga. Escribir exige permiso para editar la base de conocimiento. [[#permissions #encryption]]
**Qué se sella y cuándo.** Al guardar se serializa el documento, se cifra con la clave de la organización en el navegador y se envían tres textos cifrados por separado: el título, el cuerpo entero y un extracto corto derivado del documento para que las listas y la búsqueda nunca necesiten pedir el cuerpo. El servidor guarda los tres como bytes opacos. Un documento tiene un tope de medio megabyte antes del cifrado, y uno sin guardar existe solo en el navegador, porque no se conserva ningún borrador en ninguna parte. [[#encryption #server-holds]]
**Lo que hace un primer guardado y en qué orden.** Un artículo nuevo se crea primero, sus imágenes se suben contra el nuevo identificador y una segunda escritura sustituye el cuerpo por las referencias a los adjuntos. Una imagen cuya subida falla deja una referencia que no resuelve nada y el artículo se guarda igual, que es el único caso en el que un artículo queda incompleto. Un archivo que no es una imagen solo se puede adjuntar a un artículo que ya existe. [Archivos adjuntos](#library/attachments) trata la subida en sí. [[#failure-states]]
**Comprobaciones de accesibilidad que no salen del dispositivo.** El editor recorre el documento en busca de niveles de encabezado saltados, encabezados vacíos, imágenes sin texto alternativo y textos de enlace demasiado genéricos para servir de algo, y pide el texto alternativo antes de insertar una imagen, con una marca para las imágenes decorativas. El recorrido se hace sobre el documento en el navegador y no pregunta nada al servidor. [[#client-data]]
**La base del editor y la ruta de guardado.** El modelo de documento es el esquema compartido de ProseMirror, en \`packages/client/src/lib/editor/prosemirror-schema.ts\`, las comprobaciones son \`checkDocument\`, en \`editor/atag-checks.ts\`, y el guardado es \`handleSave\`, en \`packages/client/src/lib/components/library/ArticleEditor.svelte\`, contra \`createItem\` y \`updateItem\`, en \`packages/server/src/routes/kb.ts\`. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que el servidor guarda en todo el esquema. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè rìch tèxt èdìtòr sùppòrts hèàdìngs (fòùr lèvèls), bòld, ìtàlìc, strìkèthròùgh, ìnlìnè còdè, blòckqùòtès, bùllèt lìsts, òrdèrèd lìsts, còdè blòcks, lìnks, tàblès, hòrìzòntàl rùlès, ànd fìgùrès wìth càptìòns.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dràftìng còntròls. ••••••** Thè èdìtòr nàvìgàtìòn bàr càrrìès ùndò, rèdò, ànd à pùblìsh bùttòn thàt stàys dìsàblèd ùntìl thè àrtìclè ìs còmplètè ènòùgh tò sàvè, ànd càncèllìng wìth ùnsàvèd chàngès àsks bèfòrè dìscàrdìng.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìmàgès ànd àttàchmènts. •••••••** Ìmàgès càn bè ìnsèrtèd ìnlìnè ìn thè àrtìclè bòdy. Òthèr fìlè typès sùch às PDFs càn bè àttàchèd tò àn àrtìclè ànd àppèàr às dòwnlòàd chìps. Àll àttàchmènts àrè èncryptèd wìth thè òrgànìzàtìòn kèy bèfòrè stòràgè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àccèssìbìlìty. •••••** Thè èdìtòr chècks hèàdìng hìèràrchy, wàrns àbòùt gènèrìc lìnk tèxt, ànd pròmpts fòr ìmàgè àlt tèxt bèfòrè ìnsèrtìng àn ìmàgè. À chèckbòx màrks dècòràtìvè ìmàgès thàt dò nòt nèèd àlt tèxt. Thè lìbràry sèèds àn àrtìclè nàmèd Try thè àccèssìbìlìty chèckèr whòsè dèlìbèràtè pròblèms shòw thèsè chècks fìrìng whèn òpènèd ìn thè èdìtòr.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè fùll àrtìclè bòdy ìs èncryptèd wìth thè òrgànìzàtìòn kèy ìn thè bròwsèr bèfòrè bèìng sènt tò à sèrvèr thàt stòrès cìphèrtèxt ìt cànnòt rèàd. ••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An article is written as a structured document with headings, lists, quotes, code, tables, links, images and figures, and the browser seals it before it leav..." |
*
* @param {Demo_Narrative_Topic_Library_Editor_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_editor_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Editor_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Editor_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_library_editor_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_library_editor_body(inputs)
	return en_demo_narrative_topic_library_editor_body(inputs)
});