/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Kb_BodyInputs */

const en_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The knowledge base section shows the five most recently edited articles, newest edit first, under the section's category and author filters. The heading shows the total number of articles matching those filters. Viewing them requires the View knowledge base permission. Without that permission the section and its navigation entry do not appear. [[#permissions #encryption]]
**Article fields and encryption.** Title and excerpt are organization-key ciphertext that the browser decrypts. The server stores them but cannot read them. Category, the author's internal account ID, two vote tallies, rating, and both timestamps (created, last edited) are plaintext. Volunteer names are encrypted separately and do not appear in the account ID. A database dump reveals how many articles an organization has, when each was written and last edited, which internal account created each one, and which articles attract votes. It does not reveal any title, excerpt, or volunteer name. [[#server-holds #metadata]]
**Empty state and shared table.** When no articles exist or a filter matches nothing, the section says so instead of rendering an empty list. The section and the full library read from the same article listing. An edit made anywhere appears here within a minute while the tab is visible. [Browsing articles](#library/browse) covers the library and its search. [[#failure-states]]
**Recent-articles query and indexes.** The section calls \`kb.listItems\` with a limit of five, sorted by last edit. The endpoint accepts up to one hundred rows per request. The migration is \`038_create_kb_items.ts\`. Indexes cover category with creation time and rating, so ordering by last edit requires a table scan rather than an index read. [[#metadata]]`)
};

const es_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de base de conocimiento muestra los cinco artículos editados más recientemente, ordenados por fecha de última edición, bajo los filtros de categoría y autor de la sección. El encabezado muestra el número total de artículos que coinciden con esos filtros. Verlos requiere el permiso Ver base de conocimiento. Sin ese permiso la sección y su entrada de navegación no aparecen. [[#permissions #encryption]]
**Campos de artículo y cifrado.** El título y el extracto son texto cifrado con la clave de organización que el navegador descifra. El servidor los almacena pero no puede leerlos. La categoría, el identificador interno de cuenta del autor, dos conteos de votos, la calificación y ambas marcas de tiempo (creación y última edición) son texto plano. Los nombres de los voluntarios se cifran por separado y no aparecen en el identificador de cuenta. Un volcado de la base de datos revela cuántos artículos tiene una organización, cuándo se escribió y editó cada uno, qué cuenta interna creó cada artículo y cuáles reciben votos. No revela ningún título, extracto ni nombre de voluntario. [[#server-holds #metadata]]
**Estado vacío y tabla compartida.** Cuando no existen artículos o un filtro no coincide con nada, la sección lo indica en lugar de mostrar una lista vacía. La sección y la biblioteca completa leen del mismo listado de artículos. Una edición realizada en cualquier parte aparece aquí en menos de un minuto mientras la pestaña esté visible. [Explorar artículos](#library/browse) cubre la biblioteca y su búsqueda. [[#failure-states]]
**Consulta de artículos recientes e índices.** La sección llama a \`kb.listItems\` con un límite de cinco, ordenado por última edición. El endpoint acepta hasta cien filas por solicitud. La migración es \`038_create_kb_items.ts\`. Los índices cubren categoría con fecha de creación y calificación, así que ordenar por última edición requiere un recorrido de tabla en lugar de una lectura por índice. [[#metadata]]`)
};

const en_xa2_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè knòwlèdgè bàsè sèctìòn shòws thè fìvè mòst rècèntly èdìtèd àrtìclès, nèwèst èdìt fìrst, ùndèr thè sèctìòn's càtègòry ànd àùthòr fìltèrs. Thè hèàdìng shòws thè tòtàl nùmbèr òf àrtìclès màtchìng thòsè fìltèrs. Vìèwìng thèm rèqùìrès thè Vìèw knòwlèdgè bàsè pèrmìssìòn. Wìthòùt thàt pèrmìssìòn thè sèctìòn ànd ìts nàvìgàtìòn èntry dò nòt àppèàr. [[#pèrmìssìòns #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àrtìclè fìèlds ànd èncryptìòn. •••••••••** Tìtlè ànd èxcèrpt àrè òrgànìzàtìòn-kèy cìphèrtèxt thàt thè bròwsèr dècrypts. Thè sèrvèr stòrès thèm bùt cànnòt rèàd thèm. Càtègòry, thè àùthòr's ìntèrnàl àccòùnt ÌD, twò vòtè tàllìès, ràtìng, ànd bòth tìmèstàmps (crèàtèd, làst èdìtèd) àrè plàìntèxt. Vòlùntèèr nàmès àrè èncryptèd sèpàràtèly ànd dò nòt àppèàr ìn thè àccòùnt ÌD. À dàtàbàsè dùmp rèvèàls hòw màny àrtìclès àn òrgànìzàtìòn hàs, whèn èàch wàs wrìttèn ànd làst èdìtèd, whìch ìntèrnàl àccòùnt crèàtèd èàch ònè, ànd whìch àrtìclès àttràct vòtès. Ìt dòès nòt rèvèàl àny tìtlè, èxcèrpt, òr vòlùntèèr nàmè. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èmpty stàtè ànd shàrèd tàblè. •••••••••** Whèn nò àrtìclès èxìst òr à fìltèr màtchès nòthìng, thè sèctìòn sàys sò ìnstèàd òf rèndèrìng àn èmpty lìst. Thè sèctìòn ànd thè fùll lìbràry rèàd fròm thè sàmè àrtìclè lìstìng. Àn èdìt màdè ànywhèrè àppèàrs hèrè wìthìn à mìnùtè whìlè thè tàb ìs vìsìblè. [Bròwsìng àrtìclès](#lìbràry/bròwsè) còvèrs thè lìbràry ànd ìts sèàrch. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rècènt-àrtìclès qùèry ànd ìndèxès. •••••••••••** Thè sèctìòn càlls \`kb.lìstÌtèms\` wìth à lìmìt òf fìvè, sòrtèd by làst èdìt. Thè èndpòìnt àccèpts ùp tò ònè hùndrèd ròws pèr rèqùèst. Thè mìgràtìòn ìs \`038_crèàtè_kb_ìtèms.ts\`. Ìndèxès còvèr càtègòry wìth crèàtìòn tìmè ànd ràtìng, sò òrdèrìng by làst èdìt rèqùìrès à tàblè scàn ràthèr thàn àn ìndèx rèàd. [[#mètàdàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The knowledge base section shows the five most recently edited articles, newest edit first, under the section's category and author filters. The heading show..." |
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