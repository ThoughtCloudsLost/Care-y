/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Browse_BodyInputs */

const en_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Any user holding the View knowledge base permission can read every article the organization keeps, with no per-article access restriction. An article has no draft state; saving it makes it visible to every user with that permission. The list loads fifty articles at a time, newest first, and scrolling fetches the next fifty. [[#permissions #client-data]]
**What does each row carry?** Title and excerpt are organization-key ciphertext that the browser decrypts. Category, the author's internal account identifier, vote tallies, rating and timestamps are plaintext the server can read. The author's display name is encrypted separately. [Knowledge base](#dashboard/kb) covers that row column by column. [[#encryption #server-holds]]
**How does category filtering work?** The listing endpoint accepts a list of categories and filters on the server in a single expression that serves both the page and the total. The count beside the list reflects the server total for the active filters. Per-category article counts come from the server and appear in the manage-categories sheet. [[#metadata #failure-states]]
**The listing query and its paging.** \`listItems\` in \`packages/server/src/routes/kb.ts\` calls \`list\` in \`packages/server/src/kb/service.ts\`, which pages by keyset on the sort field and the identifier rather than by offset. Timestamps are truncated to milliseconds so a page boundary cannot repeat a row. The schema caps a single request at one hundred rows, and this surface requests fifty. [List tools](#library/tools) covers the sort and filter dimensions the query accepts. [[#client-data]]`)
};

const es_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toda persona con el permiso Ver base de conocimiento puede leer todos los artículos de la organización, sin restricción de acceso por artículo. Un artículo no tiene estado de borrador; guardarlo lo hace visible para toda persona con ese permiso. La lista carga cincuenta artículos a la vez, del más reciente al más antiguo, y al desplazarse se obtienen los siguientes cincuenta. [[#permissions #client-data]]
**¿Qué contiene cada fila?** El título y el extracto son texto cifrado con la clave de organización que el navegador descifra. La categoría, el identificador interno de cuenta del autor, los conteos de votos, la calificación y las marcas de tiempo son texto plano que el servidor puede leer. El nombre visible del autor se cifra por separado. [Base de conocimiento](#dashboard/kb) trata esa fila columna por columna. [[#encryption #server-holds]]
**¿Cómo funciona el filtro por categoría?** El endpoint de listado acepta una lista de categorías y filtra en el servidor con una sola expresión que sirve tanto para la página como para el total. El conteo junto a la lista refleja el total del servidor para los filtros activos. Los conteos de artículos por categoría provienen del servidor y aparecen en la hoja de gestión de categorías. [[#metadata #failure-states]]
**La consulta de listado y su paginación.** \`listItems\` en \`packages/server/src/routes/kb.ts\` llama a \`list\` en \`packages/server/src/kb/service.ts\`, que pagina por keyset sobre el campo de orden y el identificador en lugar de por desplazamiento. Las marcas de tiempo se truncan a milisegundos para que un límite de página no repita una fila. El esquema limita cada solicitud a cien filas, y esta superficie solicita cincuenta. [Herramientas de la lista](#library/tools) trata las dimensiones de orden y filtro que la consulta acepta. [[#client-data]]`)
};

const en_xa2_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àny ùsèr hòldìng thè Vìèw knòwlèdgè bàsè pèrmìssìòn càn rèàd èvèry àrtìclè thè òrgànìzàtìòn kèèps, wìth nò pèr-àrtìclè àccèss rèstrìctìòn. Àn àrtìclè hàs nò dràft stàtè; sàvìng ìt màkès ìt vìsìblè tò èvèry ùsèr wìth thàt pèrmìssìòn. Thè lìst lòàds fìfty àrtìclès àt à tìmè, nèwèst fìrst, ànd scròllìng fètchès thè nèxt fìfty. [[#pèrmìssìòns #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès èàch ròw càrry? ••••••••** Tìtlè ànd èxcèrpt àrè òrgànìzàtìòn-kèy cìphèrtèxt thàt thè bròwsèr dècrypts. Càtègòry, thè àùthòr's ìntèrnàl àccòùnt ìdèntìfìèr, vòtè tàllìès, ràtìng ànd tìmèstàmps àrè plàìntèxt thè sèrvèr càn rèàd. Thè àùthòr's dìsplày nàmè ìs èncryptèd sèpàràtèly. [Knòwlèdgè bàsè](#dàshbòàrd/kb) còvèrs thàt ròw còlùmn by còlùmn. [[#èncryptìòn #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw dòès càtègòry fìltèrìng wòrk? ••••••••••** Thè lìstìng èndpòìnt àccèpts à lìst òf càtègòrìès ànd fìltèrs òn thè sèrvèr ìn à sìnglè èxprèssìòn thàt sèrvès bòth thè pàgè ànd thè tòtàl. Thè còùnt bèsìdè thè lìst rèflècts thè sèrvèr tòtàl fòr thè àctìvè fìltèrs. Pèr-càtègòry àrtìclè còùnts còmè fròm thè sèrvèr ànd àppèàr ìn thè mànàgè-càtègòrìès shèèt. [[#mètàdàtà #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè lìstìng qùèry ànd ìts pàgìng. ••••••••••** \`lìstÌtèms\` ìn \`pàckàgès/sèrvèr/src/ròùtès/kb.ts\` càlls \`lìst\` ìn \`pàckàgès/sèrvèr/src/kb/sèrvìcè.ts\`, whìch pàgès by kèysèt òn thè sòrt fìèld ànd thè ìdèntìfìèr ràthèr thàn by òffsèt. Tìmèstàmps àrè trùncàtèd tò mìllìsècònds sò à pàgè bòùndàry cànnòt rèpèàt à ròw. Thè schèmà càps à sìnglè rèqùèst àt ònè hùndrèd ròws, ànd thìs sùrfàcè rèqùèsts fìfty. [Lìst tòòls](#lìbràry/tòòls) còvèrs thè sòrt ànd fìltèr dìmènsìòns thè qùèry àccèpts. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Any user holding the View knowledge base permission can read every article the organization keeps, with no per-article access restriction. An article has no ..." |
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