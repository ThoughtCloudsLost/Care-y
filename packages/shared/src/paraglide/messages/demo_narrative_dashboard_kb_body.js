/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Kb_BodyInputs */

const en_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The knowledge base preview lists the two articles saved most recently, ordered by the time each was last edited. An account has access to them with permission to view the knowledge base. [[#permissions #encryption]]
**What an article row holds.** The title and the excerpt are organization-key ciphertext opened in the browser. The category, the author, the two vote tallies, the rating and both timestamps are plaintext. A database dump shows how many articles an organization keeps, when each was written and last edited, and which ones attract votes, and no title. [[#server-holds #metadata]]
**When the library has no articles.** The section reports that instead of an empty list. The same table backs the library itself, so an article added anywhere appears here on the next load. [Browsing articles](#library/browse) covers the library and its search. [[#failure-states]]
**The recent-articles query.** \`listRecentlyUpdated\` in \`packages/server/src/kb/service.ts\` orders by \`updated_at\` and accepts at most five; this surface asks for two. The row is \`038_create_kb_items.ts\`, whose indexes are on category with creation time and on rating, so ordering by last edit is a scan rather than an index read. [[#metadata]]`)
};

const es_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La vista previa de la base de conocimiento enumera los dos artículos guardados más recientemente, ordenados por la fecha de la última edición de cada uno. Una cuenta tiene acceso a ellos con permiso para ver la base de conocimiento. [[#permissions #encryption]]
**Lo que guarda la fila de un artículo.** El título y el extracto son texto cifrado con la clave de la organización que se abre en el navegador. La categoría, la autoría, los dos recuentos de votos, la valoración y ambas marcas de tiempo están en texto plano. Un volcado de la base de datos muestra cuántos artículos conserva una organización, cuándo se escribió y se editó cada uno por última vez y cuáles reciben votos, y ningún título. [[#server-holds #metadata]]
**Cuando la biblioteca no tiene artículos.** La sección lo indica en lugar de mostrar una lista vacía. La misma tabla sostiene la biblioteca, así que un artículo añadido en cualquier parte aparece aquí en la siguiente carga. [Navegar artículos](#library/browse) trata la biblioteca y su búsqueda. [[#failure-states]]
**La consulta de artículos recientes.** \`listRecentlyUpdated\`, en \`packages/server/src/kb/service.ts\`, ordena por \`updated_at\` y acepta cinco como máximo; esta superficie pide dos. La fila es \`038_create_kb_items.ts\`, cuyos índices están sobre la categoría con la fecha de creación y sobre la valoración, de modo que ordenar por última edición es un recorrido de la tabla y no una lectura de índice. [[#metadata]]`)
};

const en_xa2_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À prèvìèw òf rècèntly ùpdàtèd knòwlèdgè bàsè àrtìclès.
 •••••••••••••••••**Èncryptìòn. ••••** Àrtìclè tìtlès àrè èncryptèd wìth thè òrgànìzàtìòn kèy. Thè sèrvèr stòrès cìphèrtèxt ànd cànnòt rèàd thèm. Thè bròwsèr dècrypts tìtlès lòcàlly.
 ••••••••••••••••••••••••••••••••••••••••••••**Whèn ìt ìs èmpty. ••••••** Ìf thè lìbràry còntàìns nò àrtìclès, thìs sèctìòn dìsplàys à nòtìcè ìnstèàd. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The knowledge base preview lists the two articles saved most recently, ordered by the time each was last edited. An account has access to them with permissio..." |
*
* @param {Demo_Narrative_Dashboard_Kb_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_kb_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Kb_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Kb_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_kb_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_kb_body(inputs)
	return en_demo_narrative_dashboard_kb_body(inputs)
});