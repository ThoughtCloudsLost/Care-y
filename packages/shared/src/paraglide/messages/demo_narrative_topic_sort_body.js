/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Sort_BodyInputs */

const en_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sorting reorders the list by creation date, status, priority, last activity, queue, client or follow-up count, and the side that does the work differs by field. [[#metadata #trust-boundary]]
**The fields the server can order by.** Creation date, priority, last activity, queue and follow-up count are plaintext columns, so the server orders the rows and pages through them by keyset, with the creation time and the ticket id breaking ties in every one of those orders. A sort request therefore tells the server which dimension the account is working through and in which direction, the same way a filter request does. [Filters](#tickets/filters) covers what else a list request carries. [[#server-holds #metadata]]
**The fields only the browser can order by.** Client, title and assignee are organization-key or ticket-key ciphertext, and the new-against-active distinction is derived in the browser from the follow-up count, which leaves the server with open and closed alone. These four are ordered over decrypted values after the rows arrive, and a row still waiting on its decrypt sorts to the front of the order rather than out of it. [[#encryption #client-data]]
**When a browser order covers part of the list.** Ordering by one of those four while pages remain unfetched orders what has been loaded, and the list says so and offers to fetch the rest before ordering again. Choosing a field the server can order by sends the whole question back to the server instead. [[#failure-states]]
**New replies first.** This puts tickets with replies the user has not read ahead of the rest, under whichever order is otherwise in force. Read state is encrypted per account, so the server can neither order by it nor learn that it was used. [Unread badges](#tickets/unread-badges) covers how a reply counts as unread. [[#privacy #client-data]]
**The two sort paths.** The server clauses are the \`ORDER BY\` and keyset blocks of \`list\` in \`packages/server/src/tickets/ticket-service.ts\`, the browser comparator is \`sortTickets\` in \`packages/client/src/lib/tickets/sort-tickets.ts\`, which mirrors the server's tiebreakers so a mixed list cannot disagree with itself, and the field set that forces the browser path is \`CLIENT_ONLY_SORT_FIELDS\` in the tickets page. [[#client-data]]`)
};

const es_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El orden reorganiza la lista por fecha de creación, estado, prioridad, última actividad, cola, cliente o número de seguimientos, y el lado que hace el trabajo cambia según el campo. [[#metadata #trust-boundary]]
**Los campos que el servidor puede ordenar.** La fecha de creación, la prioridad, la última actividad, la cola y el número de seguimientos son columnas en texto plano, así que el servidor ordena las filas y pagina por conjunto de claves, con la fecha de creación y el identificador del ticket deshaciendo los empates en todos esos órdenes. Por eso una petición de orden le dice al servidor por qué dimensión avanza la cuenta y en qué sentido, igual que una petición de filtro. [Filtros](#tickets/filters) trata lo demás que lleva una petición de lista. [[#server-holds #metadata]]
**Los campos que solo puede ordenar el navegador.** El cliente, el título y la persona asignada son texto cifrado con la clave de la organización o con la del ticket, y la distinción entre nuevo y activo se deriva en el navegador a partir del número de seguimientos, lo que deja al servidor solo con abierto y cerrado. Estos cuatro se ordenan sobre valores descifrados una vez llegan las filas, y una fila que aún espera su descifrado se ordena al principio y no fuera del orden. [[#encryption #client-data]]
**Cuando un orden del navegador abarca una parte de la lista.** Ordenar por uno de esos cuatro campos mientras quedan páginas sin recuperar ordena lo que se ha cargado, y la lista lo indica y ofrece recuperar el resto antes de volver a ordenar. Elegir un campo que el servidor sabe ordenar devuelve la pregunta entera al servidor. [[#failure-states]]
**Nuevas respuestas primero.** Antepone los tickets con respuestas que la persona usuaria no ha leído al resto, bajo el orden que esté vigente. El estado de lectura está cifrado por cuenta, así que el servidor no puede ordenar por él ni enterarse de que se usó. [Insignias de no leídos](#tickets/unread-badges) trata cuándo una respuesta cuenta como no leída. [[#privacy #client-data]]
**Las dos rutas de ordenación.** Las cláusulas del servidor son los bloques de \`ORDER BY\` y de conjunto de claves de \`list\`, en \`packages/server/src/tickets/ticket-service.ts\`, el comparador del navegador es \`sortTickets\`, en \`packages/client/src/lib/tickets/sort-tickets.ts\`, que reproduce los desempates del servidor para que una lista mixta no se contradiga, y el conjunto de campos que obliga a la ruta del navegador es \`CLIENT_ONLY_SORT_FIELDS\`, en la página de tickets. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòrtìng rèòrdèrs thè lìst by crèàtìòn dàtè, stàtùs, prìòrìty, làst àctìvìty, qùèùè, clìènt òr fòllòw-ùp còùnt, ànd thè sìdè thàt dòès thè wòrk dìffèrs by fìèld. [[#mètàdàtà #trùst-bòùndàry]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fìèlds thè sèrvèr càn òrdèr by. •••••••••••** Crèàtìòn dàtè, prìòrìty, làst àctìvìty, qùèùè ànd fòllòw-ùp còùnt àrè plàìntèxt còlùmns, sò thè sèrvèr òrdèrs thè ròws ànd pàgès thròùgh thèm by kèysèt, wìth thè crèàtìòn tìmè ànd thè tìckèt ìd brèàkìng tìès ìn èvèry ònè òf thòsè òrdèrs. À sòrt rèqùèst thèrèfòrè tèlls thè sèrvèr whìch dìmènsìòn thè àccòùnt ìs wòrkìng thròùgh ànd ìn whìch dìrèctìòn, thè sàmè wày à fìltèr rèqùèst dòès. [Fìltèrs](#tìckèts/fìltèrs) còvèrs whàt èlsè à lìst rèqùèst càrrìès. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fìèlds ònly thè bròwsèr càn òrdèr by. •••••••••••••** Clìènt, tìtlè ànd àssìgnèè àrè òrgànìzàtìòn-kèy òr tìckèt-kèy cìphèrtèxt, ànd thè nèw-àgàìnst-àctìvè dìstìnctìòn ìs dèrìvèd ìn thè bròwsèr fròm thè fòllòw-ùp còùnt, whìch lèàvès thè sèrvèr wìth òpèn ànd clòsèd àlònè. Thèsè fòùr àrè òrdèrèd òvèr dècryptèd vàlùès àftèr thè ròws àrrìvè, ànd à ròw stìll wàìtìng òn ìts dècrypt sòrts tò thè frònt òf thè òrdèr ràthèr thàn òùt òf ìt. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn à bròwsèr òrdèr còvèrs pàrt òf thè lìst. ••••••••••••••** Òrdèrìng by ònè òf thòsè fòùr whìlè pàgès rèmàìn ùnfètchèd òrdèrs whàt hàs bèèn lòàdèd, ànd thè lìst sàys sò ànd òffèrs tò fètch thè rèst bèfòrè òrdèrìng àgàìn. Chòòsìng à fìèld thè sèrvèr càn òrdèr by sènds thè whòlè qùèstìòn bàck tò thè sèrvèr ìnstèàd. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Nèw rèplìès fìrst. ••••••** Thìs pùts tìckèts wìth rèplìès thè ùsèr hàs nòt rèàd àhèàd òf thè rèst, ùndèr whìchèvèr òrdèr ìs òthèrwìsè ìn fòrcè. Rèàd stàtè ìs èncryptèd pèr àccòùnt, sò thè sèrvèr càn nèìthèr òrdèr by ìt nòr lèàrn thàt ìt wàs ùsèd. [Ùnrèàd bàdgès](#tìckèts/ùnrèàd-bàdgès) còvèrs hòw à rèply còùnts às ùnrèàd. [[#prìvàcy #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè twò sòrt pàths. ••••••** Thè sèrvèr clàùsès àrè thè \`ÒRDÈR BY\` ànd kèysèt blòcks òf \`lìst\` ìn \`pàckàgès/sèrvèr/src/tìckèts/tìckèt-sèrvìcè.ts\`, thè bròwsèr còmpàràtòr ìs \`sòrtTìckèts\` ìn \`pàckàgès/clìènt/src/lìb/tìckèts/sòrt-tìckèts.ts\`, whìch mìrròrs thè sèrvèr's tìèbrèàkèrs sò à mìxèd lìst cànnòt dìsàgrèè wìth ìtsèlf, ànd thè fìèld sèt thàt fòrcès thè bròwsèr pàth ìs \`CLÌÈNT_ÒNLY_SÒRT_FÌÈLDS\` ìn thè tìckèts pàgè. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Sorting reorders the list by creation date, status, priority, last activity, queue, client or follow-up count, and the side that does the work differs by fie..." |
*
* @param {Demo_Narrative_Topic_Sort_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_sort_body = /** @type {((inputs?: Demo_Narrative_Topic_Sort_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Sort_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_sort_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_sort_body(inputs)
	return en_demo_narrative_topic_sort_body(inputs)
});