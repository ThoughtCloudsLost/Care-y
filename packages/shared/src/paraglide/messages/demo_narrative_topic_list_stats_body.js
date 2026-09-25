/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_List_Stats_BodyInputs */

const en_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The counts report how many tickets are new, active and on hold across every queue the user has access to, and how many carry replies the user has not read. [[#metadata]]
**What each status count includes.** New counts open tickets that are not on hold and have no follow-ups at all. Active counts open tickets that are not on hold with at least one follow-up. On hold counts every ticket carrying the hold flag, closed ones as well, which is why lifting a hold moves a ticket between two of these numbers and closing it does not. One query computes all of them from plaintext columns over the accessible queues, and an account belonging to no queue gets zeros rather than an error. [[#server-holds #metadata]]
**Why the unread number arrives after the others.** It is assembled in the browser. A sweep enumerates the account's read-cursor rows across every open ticket it has access to, each cursor decrypts in the crypto worker, and the number is reported once all of them have settled, so it is absent for the first moments of a load rather than starting at zero. No server count stands behind it, because the server cannot read a cursor. [Unread badges](#tickets/unread-badges) covers what makes a ticket unread. [[#encryption #client-data]]
**The caught-up line.** A line stating that nothing is unread is shown when the new replies first sort is on, the sweep finds no unread ticket anywhere in the account's queues, no search is running and the list has rows. It reports the account's present state across all of its queues and carries no date. [[#client-data]]
**The counts query and the sweep.** \`counts\` in \`packages/server/src/tickets/ticket-service.ts\` sums one case expression per bucket in a single pass with a left join for follow-up totals, the sweep is \`readStateSweep\` in the same service against \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\`, and the line's condition is \`showCaughtUpLine\` in \`packages/client/src/lib/tickets/ticket-list-utils.ts\`. [[#metadata]]`)
};

const es_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los conteos indican cuántos tickets están nuevos, activos y en espera en todas las colas a las que tiene acceso la persona usuaria, y cuántos llevan respuestas que no ha leído. [[#metadata]]
**Qué incluye cada conteo de estado.** Nuevos cuenta los tickets abiertos que no están en espera y no tienen ningún seguimiento. Activos cuenta los tickets abiertos que no están en espera y tienen al menos un seguimiento. En espera cuenta todos los tickets con la marca de espera, también los cerrados, y por eso levantar una espera mueve un ticket entre dos de estos números y cerrarlo no. Una sola consulta los calcula todos a partir de columnas en texto plano sobre las colas accesibles, y una cuenta que no pertenece a ninguna cola recibe ceros en lugar de un error. [[#server-holds #metadata]]
**Por qué el número de no leídos llega después que los demás.** Se arma en el navegador. Un barrido enumera las filas de cursor de lectura de la cuenta en todos los tickets abiertos a los que tiene acceso, cada cursor se descifra en el worker criptográfico y el número se indica cuando todos se han asentado, de modo que no aparece durante los primeros instantes de una carga en lugar de empezar en cero. Detrás no hay ningún recuento del servidor, porque el servidor no puede leer un cursor. [Insignias de no leídos](#tickets/unread-badges) trata qué hace que un ticket esté sin leer. [[#encryption #client-data]]
**La línea de al día.** Se muestra una línea que indica que no queda nada sin leer cuando está activado el orden de nuevas respuestas primero, el barrido no encuentra ningún ticket sin leer en las colas de la cuenta, no hay ninguna búsqueda en curso y la lista tiene filas. Indica el estado actual de la cuenta en todas sus colas y no lleva ninguna fecha. [[#client-data]]
**La consulta de recuentos y el barrido.** \`counts\`, en \`packages/server/src/tickets/ticket-service.ts\`, suma una expresión condicional por grupo en una sola pasada con una unión externa para los totales de seguimientos, el barrido es \`readStateSweep\`, en el mismo servicio, contra \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\`, y la condición de la línea es \`showCaughtUpLine\`, en \`packages/client/src/lib/tickets/ticket-list-utils.ts\`. [[#metadata]]`)
};

const en_xa2_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè còùnts rèpòrt hòw màny tìckèts àrè nèw, àctìvè ànd òn hòld àcròss èvèry qùèùè thè ùsèr hàs àccèss tò, ànd hòw màny càrry rèplìès thè ùsèr hàs nòt rèàd. [[#mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt èàch stàtùs còùnt ìnclùdès. ••••••••••** Nèw còùnts òpèn tìckèts thàt àrè nòt òn hòld ànd hàvè nò fòllòw-ùps àt àll. Àctìvè còùnts òpèn tìckèts thàt àrè nòt òn hòld wìth àt lèàst ònè fòllòw-ùp. Òn hòld còùnts èvèry tìckèt càrryìng thè hòld flàg, clòsèd ònès às wèll, whìch ìs why lìftìng à hòld mòvès à tìckèt bètwèèn twò òf thèsè nùmbèrs ànd clòsìng ìt dòès nòt. Ònè qùèry còmpùtès àll òf thèm fròm plàìntèxt còlùmns òvèr thè àccèssìblè qùèùès, ànd àn àccòùnt bèlòngìng tò nò qùèùè gèts zèròs ràthèr thàn àn èrròr. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why thè ùnrèàd nùmbèr àrrìvès àftèr thè òthèrs. •••••••••••••••** Ìt ìs àssèmblèd ìn thè bròwsèr. À swèèp ènùmèràtès thè àccòùnt's rèàd-cùrsòr ròws àcròss èvèry òpèn tìckèt ìt hàs àccèss tò, èàch cùrsòr dècrypts ìn thè cryptò wòrkèr, ànd thè nùmbèr ìs rèpòrtèd òncè àll òf thèm hàvè sèttlèd, sò ìt ìs àbsènt fòr thè fìrst mòmènts òf à lòàd ràthèr thàn stàrtìng àt zèrò. Nò sèrvèr còùnt stànds bèhìnd ìt, bècàùsè thè sèrvèr cànnòt rèàd à cùrsòr. [Ùnrèàd bàdgès](#tìckèts/ùnrèàd-bàdgès) còvèrs whàt màkès à tìckèt ùnrèàd. [[#èncryptìòn #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè càùght-ùp lìnè. ••••••** À lìnè stàtìng thàt nòthìng ìs ùnrèàd ìs shòwn whèn thè nèw rèplìès fìrst sòrt ìs òn, thè swèèp fìnds nò ùnrèàd tìckèt ànywhèrè ìn thè àccòùnt's qùèùès, nò sèàrch ìs rùnnìng ànd thè lìst hàs ròws. Ìt rèpòrts thè àccòùnt's prèsènt stàtè àcròss àll òf ìts qùèùès ànd càrrìès nò dàtè. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè còùnts qùèry ànd thè swèèp. ••••••••••** \`còùnts\` ìn \`pàckàgès/sèrvèr/src/tìckèts/tìckèt-sèrvìcè.ts\` sùms ònè càsè èxprèssìòn pèr bùckèt ìn à sìnglè pàss wìth à lèft jòìn fòr fòllòw-ùp tòtàls, thè swèèp ìs \`rèàdStàtèSwèèp\` ìn thè sàmè sèrvìcè àgàìnst \`pàckàgès/clìènt/src/lìb/tìckèts/crèàtè-lìst-rèàd-stàtè.svèltè.ts\`, ànd thè lìnè's còndìtìòn ìs \`shòwCàùghtÙpLìnè\` ìn \`pàckàgès/clìènt/src/lìb/tìckèts/tìckèt-lìst-ùtìls.ts\`. [[#mètàdàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The counts report how many tickets are new, active and on hold across every queue the user has access to, and how many carry replies the user has not read. [..." |
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