/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_List_Stats_BodyInputs */

const en_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The ticket list shows counts across the queues the account can access, plus a count of tickets carrying replies the user has not read. The status counts are New, Active, and On hold. [[#metadata]]
**Status counts.** Each status count covers open tickets in the accessible queues:
- New: open tickets that are not on hold and have no volunteer reply or answered call yet. Internal notes and the client's opening message do not count.
- Active: open tickets that are not on hold and have at least one volunteer reply or answered call.
- On hold: open tickets carrying the hold flag.
One query computes them from plaintext columns. An account that belongs to no queue gets zeros rather than an error. [[#server-holds #metadata]]
**Unread count.** The unread count is computed in the browser, not by the server. A sweep decrypts the account's read-cursor record for each open ticket it can access. The count appears only once all cursors have been decrypted, so it is absent for the first moments of a load rather than starting at zero. The server cannot produce this count because it cannot read a cursor. When the new-replies-first [sort](#tickets/sort) is on and the sweep finds no unread ticket, a line says nothing is unread across the queues the account can access. [Unread badges](#tickets/unread-badges) covers what makes a ticket unread. [[#encryption #client-data]]
**Counts query, unread sweep, and line condition.** \`counts\` in \`packages/server/src/tickets/ticket-service.ts\` sums one case expression per bucket in a single pass; \`hasResponse\` in \`packages/server/src/tickets/has-response.ts\` provides the EXISTS subquery that separates New from Active. The unread sweep is \`readStateSweep\` in the same service, consumed by \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\`. The caught-up line's condition is \`showCaughtUpLine\` in \`packages/client/src/lib/tickets/ticket-list-utils.ts\`. [[#metadata]]`)
};

const es_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de tickets muestra conteos en todas las colas a las que puede acceder la cuenta, más un conteo de tickets con respuestas que la persona usuaria no ha leído. Los conteos de estado son Nuevos, Activos y En espera. [[#metadata]]
**Conteos de estado.** Cada conteo de estado abarca tickets abiertos en las colas accesibles:
- Nuevos: tickets abiertos que no están en espera y no tienen respuesta de persona voluntaria ni llamada contestada todavía. Las notas internas y el mensaje inicial del cliente no cuentan.
- Activos: tickets abiertos que no están en espera y tienen al menos una respuesta de persona voluntaria o llamada contestada.
- En espera: tickets abiertos con la marca de espera.
Una sola consulta los calcula a partir de columnas en texto plano. Una cuenta que no pertenece a ninguna cola recibe ceros en lugar de un error. [[#server-holds #metadata]]
**Conteo de no leídos.** El conteo de no leídos se calcula en el navegador, no en el servidor. Un barrido descifra el registro de cursor de lectura de la cuenta para cada ticket abierto al que puede acceder. El conteo aparece solo cuando todos los cursores se han descifrado, por lo que no aparece durante los primeros instantes de una carga en lugar de empezar en cero. El servidor no puede producir este conteo porque no puede leer un cursor. Cuando el [ordenamiento](#tickets/sort) de nuevas respuestas primero está activado y el barrido no encuentra ningún ticket sin leer, una línea indica que no queda nada sin leer en las colas a las que puede acceder la cuenta. [Insignias de no leídos](#tickets/unread-badges) trata qué hace que un ticket esté sin leer. [[#encryption #client-data]]
**Consulta de conteos, barrido de no leídos y condición de la línea.** \`counts\`, en \`packages/server/src/tickets/ticket-service.ts\`, suma una expresión condicional por grupo en una sola pasada; \`hasResponse\`, en \`packages/server/src/tickets/has-response.ts\`, proporciona la subconsulta EXISTS que separa Nuevos de Activos. El barrido de no leídos es \`readStateSweep\`, en el mismo servicio, consumido por \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\`. La condición de la línea de al día es \`showCaughtUpLine\`, en \`packages/client/src/lib/tickets/ticket-list-utils.ts\`. [[#metadata]]`)
};

const en_xa2_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìckèt lìst shòws còùnts àcròss thè qùèùès thè àccòùnt càn àccèss, plùs à còùnt òf tìckèts càrryìng rèplìès thè ùsèr hàs nòt rèàd. Thè stàtùs còùnts àrè Nèw, Àctìvè, ànd Òn hòld. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Stàtùs còùnts. •••••** Èàch stàtùs còùnt còvèrs òpèn tìckèts ìn thè àccèssìblè qùèùès:
- Nèw: òpèn tìckèts thàt àrè nòt òn hòld ànd hàvè nò vòlùntèèr rèply òr ànswèrèd càll yèt. Ìntèrnàl nòtès ànd thè clìènt's òpènìng mèssàgè dò nòt còùnt.
- Àctìvè: òpèn tìckèts thàt àrè nòt òn hòld ànd hàvè àt lèàst ònè vòlùntèèr rèply òr ànswèrèd càll.
- Òn hòld: òpèn tìckèts càrryìng thè hòld flàg.
Ònè qùèry còmpùtès thèm fròm plàìntèxt còlùmns. Àn àccòùnt thàt bèlòngs tò nò qùèùè gèts zèròs ràthèr thàn àn èrròr. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ùnrèàd còùnt. ••••** Thè ùnrèàd còùnt ìs còmpùtèd ìn thè bròwsèr, nòt by thè sèrvèr. À swèèp dècrypts thè àccòùnt's rèàd-cùrsòr rècòrd fòr èàch òpèn tìckèt ìt càn àccèss. Thè còùnt àppèàrs ònly òncè àll cùrsòrs hàvè bèèn dècryptèd, sò ìt ìs àbsènt fòr thè fìrst mòmènts òf à lòàd ràthèr thàn stàrtìng àt zèrò. Thè sèrvèr cànnòt pròdùcè thìs còùnt bècàùsè ìt cànnòt rèàd à cùrsòr. Whèn thè nèw-rèplìès-fìrst [sòrt](#tìckèts/sòrt) ìs òn ànd thè swèèp fìnds nò ùnrèàd tìckèt, à lìnè sàys nòthìng ìs ùnrèàd àcròss thè qùèùès thè àccòùnt càn àccèss. [Ùnrèàd bàdgès](#tìckèts/ùnrèàd-bàdgès) còvèrs whàt màkès à tìckèt ùnrèàd. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còùnts qùèry, ùnrèàd swèèp, ànd lìnè còndìtìòn. •••••••••••••••** \`còùnts\` ìn \`pàckàgès/sèrvèr/src/tìckèts/tìckèt-sèrvìcè.ts\` sùms ònè càsè èxprèssìòn pèr bùckèt ìn à sìnglè pàss; \`hàsRèspònsè\` ìn \`pàckàgès/sèrvèr/src/tìckèts/hàs-rèspònsè.ts\` pròvìdès thè ÈXÌSTS sùbqùèry thàt sèpàràtès Nèw fròm Àctìvè. Thè ùnrèàd swèèp ìs \`rèàdStàtèSwèèp\` ìn thè sàmè sèrvìcè, cònsùmèd by \`pàckàgès/clìènt/src/lìb/tìckèts/crèàtè-lìst-rèàd-stàtè.svèltè.ts\`. Thè càùght-ùp lìnè's còndìtìòn ìs \`shòwCàùghtÙpLìnè\` ìn \`pàckàgès/clìènt/src/lìb/tìckèts/tìckèt-lìst-ùtìls.ts\`. [[#mètàdàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The ticket list shows counts across the queues the account can access, plus a count of tickets carrying replies the user has not read. The status counts are ..." |
*
* @param {Demo_Narrative_Topic_List_Stats_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_stats_body = /** @type {((inputs?: Demo_Narrative_Topic_List_Stats_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_List_Stats_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_list_stats_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_list_stats_body(inputs)
	return en_demo_narrative_topic_list_stats_body(inputs)
});