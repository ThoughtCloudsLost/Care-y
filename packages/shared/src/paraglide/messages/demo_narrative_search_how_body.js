/* eslint-disable */
import * as registry from '../registry.js'
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_How_BodyInputs */

const en_demo_narrative_search_how_body = /** @type {(inputs: Demo_Narrative_Search_How_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No search term ever leaves the device. Matching is done in the browser against text the browser has decrypted, which is what allows a query about case content to run at all when the server cannot read any of it. [[#privacy #server-holds #search]]
**The first pass.** The query runs against what the current session has already loaded and decrypted, so cases and articles answer with no request at all, and the accounts group fetches its list once the first time it is used. The pass covers whatever the surface happened to have in hand. The count under each group is what makes the gap visible, because it reports records searched against records that exist. [[#client-data #metadata]]
**The deeper pass and when it starts.** Asking for it pages in every record of that kind the account has access to, decrypts each one in the browser and matches there. It also starts on its own when the first pass finds nothing at all, on the reasoning that a query with no answer is a query that was meant for the whole set. Retyping abandons a running pass and its results rather than letting them report over the newer one. [[#failure-states #client-data]]
**What the server is asked during a deeper pass.** Two shapes of request, neither carrying a word of the query. A paging request for records, with a cursor and a page size. Then a request for the text of entries, carrying the identifiers of the cases whose titles did not match, a page number and a page size. The server answers both with ciphertext it cannot read. [[#trust-boundary #server-holds]]
**What that leaves the server able to infer.** That a deeper pass happened, when, how much was paged in, and which cases were named in the content request, which is the complement of the set whose titles matched. It does not carry what was typed, which records matched or whether anything matched at all. [The trust boundary](#deep-dive/the-trust-boundary) covers what else the server can infer from traffic. [[#metadata #trust-boundary]]
**What the server does decide.** Both requests are restricted to the queues the account has access to before any row is read, so a deeper pass cannot widen what an account can see. An account in no queue gets an empty answer rather than an error. [The permission system](#deep-dive/the-permission-system) covers that boundary. [[#permissions #server-holds]]
**Why the design holds at this scale.** Paging an organization's whole case set into a browser is workable at hundreds to a few thousand cases and is the cost of the server not being able to index the text. The comment on the search service states that tradeoff where it is made. [[#failure-states #encryption]]
**The two-pass code.** The per-kind passes are the \`fullSearch\` functions in \`packages/client/src/lib/search/providers/\`, coordinated with run identity and an abort signal in \`registry.svelte.ts\`. The server side is \`metadataSearch\` and \`contentSearch\` in \`packages/server/src/tickets/search.ts\`. [[#client-data #server-holds]]`)
};

const es_demo_narrative_search_how_body = /** @type {(inputs: Demo_Narrative_Search_How_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningún término de búsqueda sale nunca del dispositivo. La comparación se hace en el navegador contra el texto que el navegador ha descifrado, que es lo que permite que una consulta sobre el contenido de un caso funcione siquiera cuando el servidor no puede leer nada de él. [[#privacy #server-holds #search]]
**La primera pasada.** La consulta se ejecuta sobre lo que la sesión actual ya ha cargado y descifrado, de modo que los casos y los artículos responden sin ninguna petición, y el grupo de cuentas trae su lista una sola vez, la primera vez que se usa. La pasada cubre lo que la superficie tuviera a mano. El recuento bajo cada grupo es lo que hace visible la diferencia, porque indica registros examinados frente a registros existentes. [[#client-data #metadata]]
**La pasada profunda y cuándo empieza.** Pedirla trae por páginas todos los registros de esa clase a los que la cuenta tiene acceso, los descifra en el navegador y los compara allí. También empieza por su cuenta cuando la primera pasada no encuentra nada, con el razonamiento de que una consulta sin respuesta es una consulta pensada para el conjunto entero. Volver a teclear abandona una pasada en curso y sus resultados en lugar de dejar que informen por encima de la nueva. [[#failure-states #client-data]]
**Lo que se le pide al servidor durante una pasada profunda.** Dos formas de petición, y ninguna lleva una palabra de la consulta. Una petición de registros por páginas, con un cursor y un tamaño de página. Después una petición del texto de las entradas, que lleva los identificadores de los casos cuyos títulos no coincidieron, un número de página y un tamaño. El servidor responde a las dos con texto cifrado que no puede leer. [[#trust-boundary #server-holds]]
**Lo que eso le permite inferir al servidor.** Que hubo una pasada profunda, cuándo, cuánto se trajo y qué casos se nombraron en la petición de contenido, que es el complemento del conjunto cuyos títulos coincidieron. No lleva lo que se tecleó, ni qué registros coincidieron, ni si coincidió alguno. [La frontera de confianza](#deep-dive/the-trust-boundary) trata qué más puede inferir el servidor del tráfico. [[#metadata #trust-boundary]]
**Lo que el servidor sí decide.** Las dos peticiones se limitan a las colas a las que la cuenta tiene acceso antes de leer ninguna fila, así que una pasada profunda no puede ampliar lo que una cuenta ve. Una cuenta sin ninguna cola recibe una respuesta vacía en lugar de un error. [El sistema de permisos](#deep-dive/the-permission-system) trata esa frontera. [[#permissions #server-holds]]
**Por qué el diseño aguanta a esta escala.** Traer al navegador todo el conjunto de casos de una organización es viable con cientos o unos pocos miles de casos y es el coste de que el servidor no pueda indexar el texto. El comentario del servicio de búsqueda deja escrito ese compromiso donde se toma. [[#failure-states #encryption]]
**El código de las dos pasadas.** Las pasadas por clase son las funciones \`fullSearch\` de \`packages/client/src/lib/search/providers/\`, coordinadas con identidad de ejecución y una señal de cancelación en \`registry.svelte.ts\`. El lado del servidor son \`metadataSearch\` y \`contentSearch\`, en \`packages/server/src/tickets/search.ts\`. [[#client-data #server-holds]]`)
};

const en_xa2_demo_narrative_search_how_body = /** @type {(inputs: Demo_Narrative_Search_How_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Glòbàl sèàrch rùns ìn twò tìèrs.
 ••••••••••**Ìnstànt rèsùlts. •••••** Thè bròwsèr fùzzy màtchès thè qùèry àgàìnst còntènt ìt hàs àlrèàdy dècryptèd ànd càchèd. Thìs rètùrns rèsùlts ìmmèdìàtèly wìth nò nètwòrk càll.
 ••••••••••••••••••••••••••••••••••••••••••••**Fùll dèèp sèàrch. ••••••** Whèn ìnstànt rèsùlts àrè ìnsùffìcìènt, thè bròwsèr fètchès èncryptèd dàtà fròm thè sèrvèr, dècrypts ìt lòcàlly, ànd màtchès thè qùèry àgàìnst thè plàìntèxt. Thè sèrvèr sènds èncryptèd blòbs bùt pèrfòrms nò tèxt màtchìng. Àll sèàrch tèrms stày òn thè dèvìcè.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còvèràgè ìndìcàtòr. ••••••** À lìnè bèlòw thè rèsùlts shòws hòw màny rècòrds hàvè bèèn sèàrchèd òùt òf thè tòtàl, sò ìt ìs clèàr whèthèr à fùll sèàrch wòùld còvèr mòrè. ••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No search term ever leaves the device. Matching is done in the browser against text the browser has decrypted, which is what allows a query about case conten..." |
*
* @param {Demo_Narrative_Search_How_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_how_body = /** @type {((inputs?: Demo_Narrative_Search_How_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_How_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_search_how_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_search_how_body(inputs)
	return en_demo_narrative_search_how_body(inputs)
});