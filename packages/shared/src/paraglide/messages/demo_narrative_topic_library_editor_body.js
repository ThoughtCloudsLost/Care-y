/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Editor_BodyInputs */

const en_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The rich text editor supports headings (four levels), bold, italic, strikethrough, inline code, blockquotes, bullet lists, ordered lists, code blocks, links, tables, horizontal rules, and figures with captions.
**Drafting controls.** The editor navigation bar carries undo, redo, and a publish button that stays disabled until the article is complete enough to save, and cancelling with unsaved changes asks before discarding.
**Images and attachments.** Images can be inserted inline in the article body. Other file types such as PDFs can be attached to an article and appear as download chips. All attachments are encrypted with the organization key before storage.
**Accessibility.** The editor checks heading hierarchy, warns about generic link text, and prompts for image alt text before inserting an image. A checkbox marks decorative images that do not need alt text. The library seeds an article named Try the accessibility checker whose deliberate problems show these checks firing when opened in the editor.
**Encryption.** The full article body is encrypted with the organization key in the browser before being sent to a server that stores ciphertext it cannot read.`)
};

const es_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El editor de texto enriquecido admite encabezados (cuatro niveles), negrita, cursiva, tachado, código en línea, citas, listas con viñetas, listas ordenadas, bloques de código, enlaces, tablas, líneas horizontales y figuras con pies de foto.
**Controles de redacción.** La barra de navegación del editor lleva deshacer, rehacer y un botón de publicar que permanece deshabilitado hasta que el artículo está suficientemente completo para guardar, y cancelar con cambios sin guardar pregunta antes de descartar.
**imágenes y adjuntos.** Las imágenes se pueden insertar directamente en el cuerpo del artículo. Otros tipos de archivo como PDFs se pueden adjuntar al artículo y aparecen como fichas de descarga. Todos los adjuntos se cifran con la clave de la organización antes de almacenarse.
**Accesibilidad.** El editor verifica la jerarquía de encabezados, advierte sobre texto de enlace genérico y solicita texto alternativo para las imágenes antes de insertarlas. Una casilla marca las imágenes decorativas que no necesitan texto alternativo. La biblioteca incluye un artículo llamado Try the accessibility checker cuyos problemas deliberados muestran estas verificaciones en acción al abrirlo en el editor.
**Cifrado.** El cuerpo completo del artículo se cifra con la clave de la organización en el navegador antes de enviarse a un servidor que almacena texto cifrado que no puede leer.`)
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
* | "The rich text editor supports headings (four levels), bold, italic, strikethrough, inline code, blockquotes, bullet lists, ordered lists, code blocks, links,..." |
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