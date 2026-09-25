/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Kb_BodyInputs */

const en_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The knowledge base preview shows the two articles edited most recently, ordered by last-edit time. Viewing them requires the view-knowledge-base permission. [[#permissions #encryption]]
**Article fields and encryption.** Title and excerpt are organization-key ciphertext that the browser decrypts. The server stores them but cannot read them. Category, the author's internal account ID, two vote tallies, rating, and both timestamps (created, last edited) are plaintext. Volunteer names are encrypted separately and do not appear in the account ID. A database dump reveals how many articles an organization has, when each was written and last edited, which internal account created each one, and which articles attract votes. It does not reveal any title, excerpt, or volunteer name. [[#server-holds #metadata]]
**Empty state and shared table.** When no articles exist, the section says so instead of rendering an empty list. The preview and the full library read from the same table, so an article added anywhere appears here on the next page load. [Browsing articles](#library/browse) covers the library and its search. [[#failure-states]]
**Recent-articles query and indexes.** \`listRecentlyUpdated\` in \`packages/server/src/kb/service.ts\` orders by \`updated_at\` and accepts at most five rows. This surface requests two. The migration is \`038_create_kb_items.ts\`. Indexes cover category with creation time and rating, so ordering by last edit requires a table scan rather than an index read. [[#metadata]]`)
};

const es_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La vista previa de la base de conocimiento muestra los dos artículos editados más recientemente, ordenados por fecha de última edición. Verlos requiere el permiso de ver la base de conocimiento. [[#permissions #encryption]]
**Campos de artículo y cifrado.** El título y el extracto son texto cifrado con la clave de organización que el navegador descifra. El servidor los almacena pero no puede leerlos. La categoría, el identificador interno de cuenta del autor, dos conteos de votos, la calificación y ambas marcas de tiempo (creación y última edición) son texto plano. Los nombres de los voluntarios se cifran por separado y no aparecen en el identificador de cuenta. Un volcado de la base de datos revela cuántos artículos tiene una organización, cuándo se escribió y editó cada uno, qué cuenta interna creó cada artículo y cuáles reciben votos. No revela ningún título, extracto ni nombre de voluntario. [[#server-holds #metadata]]
**Estado vacío y tabla compartida.** Cuando no existen artículos, la sección lo indica en lugar de mostrar una lista vacía. La vista previa y la biblioteca completa leen de la misma tabla, así que un artículo añadido en cualquier parte aparece aquí en la siguiente carga de página. [Explorar artículos](#library/browse) cubre la biblioteca y su búsqueda. [[#failure-states]]
**Consulta de artículos recientes e índices.** \`listRecentlyUpdated\` en \`packages/server/src/kb/service.ts\` ordena por \`updated_at\` y acepta como máximo cinco filas. Esta superficie solicita dos. La migración es \`038_create_kb_items.ts\`. Los índices cubren categoría con fecha de creación y calificación, así que ordenar por última edición requiere un recorrido de tabla en lugar de una lectura por índice. [[#metadata]]`)
};

const en_xa2_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè knòwlèdgè bàsè prèvìèw shòws thè twò àrtìclès èdìtèd mòst rècèntly, òrdèrèd by làst-èdìt tìmè. Vìèwìng thèm rèqùìrès thè vìèw-knòwlèdgè-bàsè pèrmìssìòn. [[#pèrmìssìòns #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àrtìclè fìèlds ànd èncryptìòn. •••••••••** Tìtlè ànd èxcèrpt àrè òrgànìzàtìòn-kèy cìphèrtèxt thàt thè bròwsèr dècrypts. Thè sèrvèr stòrès thèm bùt cànnòt rèàd thèm. Càtègòry, thè àùthòr's ìntèrnàl àccòùnt ÌD, twò vòtè tàllìès, ràtìng, ànd bòth tìmèstàmps (crèàtèd, làst èdìtèd) àrè plàìntèxt. Vòlùntèèr nàmès àrè èncryptèd sèpàràtèly ànd dò nòt àppèàr ìn thè àccòùnt ÌD. À dàtàbàsè dùmp rèvèàls hòw màny àrtìclès àn òrgànìzàtìòn hàs, whèn èàch wàs wrìttèn ànd làst èdìtèd, whìch ìntèrnàl àccòùnt crèàtèd èàch ònè, ànd whìch àrtìclès àttràct vòtès. Ìt dòès nòt rèvèàl àny tìtlè, èxcèrpt, òr vòlùntèèr nàmè. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èmpty stàtè ànd shàrèd tàblè. •••••••••** Whèn nò àrtìclès èxìst, thè sèctìòn sàys sò ìnstèàd òf rèndèrìng àn èmpty lìst. Thè prèvìèw ànd thè fùll lìbràry rèàd fròm thè sàmè tàblè, sò àn àrtìclè àddèd ànywhèrè àppèàrs hèrè òn thè nèxt pàgè lòàd. [Bròwsìng àrtìclès](#lìbràry/bròwsè) còvèrs thè lìbràry ànd ìts sèàrch. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rècènt-àrtìclès qùèry ànd ìndèxès. •••••••••••** \`lìstRècèntlyÙpdàtèd\` ìn \`pàckàgès/sèrvèr/src/kb/sèrvìcè.ts\` òrdèrs by \`ùpdàtèd_àt\` ànd àccèpts àt mòst fìvè ròws. Thìs sùrfàcè rèqùèsts twò. Thè mìgràtìòn ìs \`038_crèàtè_kb_ìtèms.ts\`. Ìndèxès còvèr càtègòry wìth crèàtìòn tìmè ànd ràtìng, sò òrdèrìng by làst èdìt rèqùìrès à tàblè scàn ràthèr thàn àn ìndèx rèàd. [[#mètàdàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The knowledge base preview shows the two articles edited most recently, ordered by last-edit time. Viewing them requires the view-knowledge-base permission. ..." |
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