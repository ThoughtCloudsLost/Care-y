/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Detail_BodyInputs */

const en_demo_narrative_library_detail_body = /** @type {(inputs: Demo_Narrative_Library_Detail_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opening an article fetches the one thing the list does not carry, its encrypted body, and decrypts it in the crypto worker before rendering it through a sanitizer. The title comes from the list the reader arrived with, so it is readable before the body lands. [[#encryption #client-data]]
**What is named beside the article.** Its category, the account that wrote it and when it was last edited. The author's display name is organization-key ciphertext resolved from names the browser already holds, so it fills in as those names decrypt rather than arriving with the article. [[#encryption]]
**Images inside the body.** The document refers to each image by attachment id, and the browser fetches the ciphertext from the blob route and decrypts it as the article renders. Nothing in the body is fetched from anywhere outside the organization's own storage. [File attachments](#library/attachments) covers that route and what it checks. [[#server-holds]]
**What an open records.** The article id and a timestamp go into the reader's own recently viewed list, sealed to that account's key and stored as one blob the server cannot open. The list carries ids and times and no titles, and an id the account can no longer read fails to resolve and is left out. A body that fails to decrypt reports that in place of the article rather than emptying the page. [[#privacy #keys #failure-states]]
**The detail query and the renderer.** \`ArticleDetailView.svelte\` in \`packages/client/src/lib/components/library/\` runs \`getItem\` from \`packages/server/src/routes/kb.ts\`, which is the only endpoint returning \`encrypted_body\`, and passes the plaintext through \`renderArticleBody\` in \`packages/client/src/lib/utils/render-article.ts\`, whose output is sanitized before it reaches the page. [[#client-data]]`)
};

const es_demo_narrative_library_detail_body = /** @type {(inputs: Demo_Narrative_Library_Detail_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abrir un artículo pide lo único que la lista no trae, su cuerpo cifrado, y lo descifra en el worker criptográfico antes de representarlo a través de un saneador. El título viene de la lista desde la que se llegó, así que se puede leer antes de que aterrice el cuerpo. [[#encryption #client-data]]
**Lo que se nombra junto al artículo.** Su categoría, la cuenta que lo escribió y cuándo se editó por última vez. El nombre visible de la autoría es texto cifrado con la clave de la organización que se resuelve a partir de los nombres que el navegador ya tiene, de modo que aparece a medida que esos nombres se descifran y no junto con el artículo. [[#encryption]]
**Las imágenes dentro del cuerpo.** El documento se refiere a cada imagen por el identificador de su adjunto, y el navegador descarga el texto cifrado desde la ruta de blobs y lo descifra mientras el artículo se representa. Nada del cuerpo se descarga de fuera del almacenamiento de la propia organización. [Archivos adjuntos](#library/attachments) trata esa ruta y lo que comprueba. [[#server-holds]]
**Lo que registra una apertura.** El identificador del artículo y una marca de tiempo pasan a la lista de vistos recientemente de quien lee, sellada con la clave de esa cuenta y guardada como un único blob que el servidor no puede abrir. La lista lleva identificadores y fechas y ningún título, y un identificador que la cuenta ya no puede leer no resuelve y queda fuera. Un cuerpo que no se puede descifrar lo indica en lugar del artículo en vez de vaciar la página. [[#privacy #keys #failure-states]]
**La consulta de detalle y el renderizador.** \`ArticleDetailView.svelte\`, en \`packages/client/src/lib/components/library/\`, ejecuta \`getItem\`, de \`packages/server/src/routes/kb.ts\`, que es el único endpoint que devuelve \`encrypted_body\`, y pasa el texto en claro por \`renderArticleBody\`, en \`packages/client/src/lib/utils/render-article.ts\`, cuya salida se sanea antes de llegar a la página. [[#client-data]]`)
};

const en_xa2_demo_narrative_library_detail_body = /** @type {(inputs: Demo_Narrative_Library_Detail_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fùll àrtìclè vìèw shòws thè còmplètè bòdy tèxt, fìlè àttàchmènts, ànd vòtìng còntròls. Thè bòdy ìs dècryptèd lòcàlly fròm cìphèrtèxt stòrèd òn thè sèrvèr.
 ••••••••••••••••••••••••••••••••••••••••••••••••**Mètàdàtà. •••** Thè dètàìl vìèw shòws thè àrtìclè tìtlè, càtègòry, àùthòr, crèàtìòn dàtè, ànd làst ùpdàtèd dàtè. Thè àùthòr's dìsplày nàmè ìs dècryptèd fròm thè òrgànìzàtìòn kèy. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Opening an article fetches the one thing the list does not carry, its encrypted body, and decrypts it in the crypto worker before rendering it through a sani..." |
*
* @param {Demo_Narrative_Library_Detail_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_detail_body = /** @type {((inputs?: Demo_Narrative_Library_Detail_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Detail_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_library_detail_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_library_detail_body(inputs)
	return en_demo_narrative_library_detail_body(inputs)
});