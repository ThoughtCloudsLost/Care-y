/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Search_BodyInputs */

const en_demo_narrative_topic_library_search_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Searching the library matches a term against the titles and excerpts already decrypted in the browser, using the same fuzzy matcher the overlay uses, and orders the list by how well each article matched. No term reaches the server. [[#privacy #client-data #search]]
**When the search goes to the bodies.** A term with no title or excerpt match starts a full pass on its own, and it can be started by hand. The pass loads every remaining page, then asks for the encrypted bodies of the articles that did not match, decrypts each one in the browser and matches the term against the text. A counter reports how many of the total have been through that pass. [[#encryption]]
**What the server learns from a full pass.** Not the term and not which articles matched, since both stay in the browser. What it does hold is the request itself: a list of article ids whose bodies were asked for, which is every article that did not match by title. The read is a plain fetch by id and no record of it is written. [[#server-holds #metadata]]
**Where a full pass stops.** The body request takes at most two hundred ids, so an organization with more articles than that beyond its title matches gets no body matches from the pass, and a failed body fetch ends it the same way. Either way the pass reports itself as finished and the title matches stand. [[#failure-states]]
**The provider and the body endpoint.** The in-page matching is \`fuzzySearch\` in \`packages/client/src/lib/search/fuzzy.js\` over the loaded pages; the full pass is the \`kb\` provider's \`fullSearch\` in \`packages/client/src/lib/search/providers/kb.ts\`, driven by \`createDeepSearch\` in \`deep-search.svelte.ts\`. The endpoint is \`listBodies\` in \`packages/server/src/routes/kb.ts\`, whose input cap is \`listKbBodiesInputSchema\`. [How search works](#search/how-it-works) covers the overlay that searches every surface at once. [[#client-data]]`)
};

const es_demo_narrative_topic_library_search_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar en la biblioteca compara un término con los títulos y extractos ya descifrados en el navegador, con el mismo comparador aproximado que usa la búsqueda general, y ordena la lista según lo bien que coincidió cada artículo. Ningún término llega al servidor. [[#privacy #client-data #search]]
**Cuándo la búsqueda pasa a los cuerpos.** Un término sin coincidencias en títulos ni extractos inicia por sí solo una pasada completa, que también puede iniciarse a mano. La pasada carga todas las páginas restantes, luego pide los cuerpos cifrados de los artículos que no coincidieron, descifra cada uno en el navegador y compara el término con el texto. Un contador indica cuántos del total han pasado por ahí. [[#encryption]]
**Lo que el servidor aprende de una pasada completa.** Ni el término ni qué artículos coincidieron, porque ambos se quedan en el navegador. Lo que sí tiene es la petición en sí: una lista de identificadores de artículo cuyos cuerpos se pidieron, que son todos los que no coincidieron por título. La lectura es una descarga por identificador y no se escribe ninguna constancia de ella. [[#server-holds #metadata]]
**Dónde se detiene una pasada completa.** La petición de cuerpos admite como mucho doscientos identificadores, así que una organización con más artículos que eso más allá de sus coincidencias por título no obtiene coincidencias de cuerpo en la pasada, y una descarga fallida la termina igual. En cualquiera de los dos casos la pasada se da por terminada y quedan las coincidencias por título. [[#failure-states]]
**El proveedor y el endpoint de cuerpos.** La comparación dentro de la página es \`fuzzySearch\`, en \`packages/client/src/lib/search/fuzzy.js\`, sobre las páginas cargadas; la pasada completa es el \`fullSearch\` del proveedor \`kb\`, en \`packages/client/src/lib/search/providers/kb.ts\`, accionado por \`createDeepSearch\`, en \`deep-search.svelte.ts\`. El endpoint es \`listBodies\`, en \`packages/server/src/routes/kb.ts\`, cuyo tope de entrada es \`listKbBodiesInputSchema\`. [Cómo funciona la búsqueda](#search/how-it-works) explica cómo la búsqueda general recorre todas las superficies a la vez. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_library_search_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrchìng thè lìbràry màtchès à tèrm àgàìnst thè tìtlès ànd èxcèrpts àlrèàdy dècryptèd ìn thè bròwsèr, ùsìng thè sàmè fùzzy màtchèr thè òvèrlày ùsès, ànd òrdèrs thè lìst by hòw wèll èàch àrtìclè màtchèd. Nò tèrm rèàchès thè sèrvèr. [[#prìvàcy #clìènt-dàtà #sèàrch]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn thè sèàrch gòès tò thè bòdìès. •••••••••••** À tèrm wìth nò tìtlè òr èxcèrpt màtch stàrts à fùll pàss òn ìts òwn, ànd ìt càn bè stàrtèd by hànd. Thè pàss lòàds èvèry rèmàìnìng pàgè, thèn àsks fòr thè èncryptèd bòdìès òf thè àrtìclès thàt dìd nòt màtch, dècrypts èàch ònè ìn thè bròwsèr ànd màtchès thè tèrm àgàìnst thè tèxt. À còùntèr rèpòrts hòw màny òf thè tòtàl hàvè bèèn thròùgh thàt pàss. [[#èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr lèàrns fròm à fùll pàss. ••••••••••••** Nòt thè tèrm ànd nòt whìch àrtìclès màtchèd, sìncè bòth stày ìn thè bròwsèr. Whàt ìt dòès hòld ìs thè rèqùèst ìtsèlf: à lìst òf àrtìclè ìds whòsè bòdìès wèrè àskèd fòr, whìch ìs èvèry àrtìclè thàt dìd nòt màtch by tìtlè. Thè rèàd ìs à plàìn fètch by ìd ànd nò rècòrd òf ìt ìs wrìttèn. [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè à fùll pàss stòps. ••••••••** Thè bòdy rèqùèst tàkès àt mòst twò hùndrèd ìds, sò àn òrgànìzàtìòn wìth mòrè àrtìclès thàn thàt bèyònd ìts tìtlè màtchès gèts nò bòdy màtchès fròm thè pàss, ànd à fàìlèd bòdy fètch ènds ìt thè sàmè wày. Èìthèr wày thè pàss rèpòrts ìtsèlf às fìnìshèd ànd thè tìtlè màtchès stànd. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè pròvìdèr ànd thè bòdy èndpòìnt. •••••••••••** Thè ìn-pàgè màtchìng ìs \`fùzzySèàrch\` ìn \`pàckàgès/clìènt/src/lìb/sèàrch/fùzzy.js\` òvèr thè lòàdèd pàgès; thè fùll pàss ìs thè \`kb\` pròvìdèr's \`fùllSèàrch\` ìn \`pàckàgès/clìènt/src/lìb/sèàrch/pròvìdèrs/kb.ts\`, drìvèn by \`crèàtèDèèpSèàrch\` ìn \`dèèp-sèàrch.svèltè.ts\`. Thè èndpòìnt ìs \`lìstBòdìès\` ìn \`pàckàgès/sèrvèr/src/ròùtès/kb.ts\`, whòsè ìnpùt càp ìs \`lìstKbBòdìèsÌnpùtSchèmà\`. [Hòw sèàrch wòrks](#sèàrch/hòw-ìt-wòrks) còvèrs thè òvèrlày thàt sèàrchès èvèry sùrfàcè àt òncè. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Searching the library matches a term against the titles and excerpts already decrypted in the browser, using the same fuzzy matcher the overlay uses, and ord..." |
*
* @param {Demo_Narrative_Topic_Library_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_search_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Search_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Search_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_library_search_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_library_search_body(inputs)
	return en_demo_narrative_topic_library_search_body(inputs)
});