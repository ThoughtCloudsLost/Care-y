/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Browse_BodyInputs */

const en_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every article an organization keeps is one list, open to any account with permission to view the knowledge base, with no per-article access rule under it. The list arrives fifty at a time, newest first, and scrolling asks for the next fifty. [[#permissions #client-data]]
**What the browser opens and what the server kept.** Each row carries an organization-key title and excerpt that the browser decrypts, and the category, author, vote tallies, rating and timestamps beside them are plaintext. [The knowledge base preview](#dashboard/kb) sets out that row column by column. An article has no draft or published state: saving it puts it in front of everyone with read permission. [[#encryption #server-holds]]
**When a filter runs in the browser instead.** The listing endpoint takes one category at a time, so a single selected category is filtered by the server and two or more are filtered in the browser over the rows already loaded. The count reported beside the list is the number of rows it holds after that pass, not the organization's total, so it climbs as scrolling loads more. [[#metadata #failure-states]]
**The listing query and its paging.** \`listItems\` in \`packages/server/src/routes/kb.ts\` runs \`list\` in \`packages/server/src/kb/service.ts\`, which pages by keyset on the sort field and the id rather than by offset, and truncates timestamps to milliseconds so a page boundary cannot repeat a row. The ceiling is a hundred per request in \`kbItemListInputSchema\`, and this surface asks for fifty. [List tools](#library/tools) covers the sort and filter dimensions that query accepts. [[#client-data]]`)
};

const es_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los artículos que conserva una organización forman una sola lista, abierta a cualquier cuenta con permiso para ver la base de conocimiento y sin ninguna regla de acceso por artículo debajo. La lista llega de cincuenta en cincuenta, del más reciente al más antiguo, y al desplazarse se piden los cincuenta siguientes. [[#permissions #client-data]]
**Lo que abre el navegador y lo que guardó el servidor.** Cada fila lleva un título y un extracto cifrados con la clave de la organización que el navegador descifra, y la categoría, la autoría, los recuentos de votos, la valoración y las marcas de tiempo que los acompañan están en texto plano. [La vista previa de la base de conocimiento](#dashboard/kb) expone esa fila columna por columna. Un artículo no tiene estado de borrador ni de publicado: guardarlo lo pone delante de todas las cuentas con permiso de lectura. [[#encryption #server-holds]]
**Cuándo un filtro se ejecuta en el navegador.** El endpoint de listado admite una categoría cada vez, así que una sola categoría seleccionada la filtra el servidor y dos o más se filtran en el navegador sobre las filas ya cargadas. El recuento que acompaña a la lista es el número de filas que tiene tras esa pasada, no el total de la organización, de modo que sube a medida que el desplazamiento carga más. [[#metadata #failure-states]]
**La consulta del listado y su paginación.** \`listItems\`, en \`packages/server/src/routes/kb.ts\`, ejecuta \`list\`, en \`packages/server/src/kb/service.ts\`, que pagina por clave sobre el campo de orden y el identificador en lugar de por desplazamiento, y trunca las marcas de tiempo a milisegundos para que un límite de página no pueda repetir una fila. El tope es de cien por petición en \`kbItemListInputSchema\`, y esta superficie pide cincuenta. [Herramientas de la lista](#library/tools) trata las dimensiones de orden y filtro que acepta esa consulta. [[#client-data]]`)
};

const en_xa2_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè lìbràry lìsts àll pùblìshèd àrtìclès gròùpèd by càtègòry. Èàch àrtìclè shòws à dècryptèd tìtlè ànd èxcèrpt. Bòth àrè stòrèd às cìphèrtèxt òn thè sèrvèr ànd dècryptèd lòcàlly wìth thè òrgànìzàtìòn kèy.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèsktòp splìt vìèw. ••••••** Òn wìdèr scrèèns, thè àrtìclè lìst ànd dètàìl vìèw sìt sìdè by sìdè, sìmìlàr tò thè tìckèt lìst splìt vìèw. •••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Every article an organization keeps is one list, open to any account with permission to view the knowledge base, with no per-article access rule under it. Th..." |
*
* @param {Demo_Narrative_Library_Browse_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_browse_body = /** @type {((inputs?: Demo_Narrative_Library_Browse_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Browse_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_library_browse_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_library_browse_body(inputs)
	return en_demo_narrative_library_browse_body(inputs)
});