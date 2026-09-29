/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_My_Tickets_BodyInputs */

const en_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`My tickets lists open tickets assigned to the signed-in user. A ticket on hold does not appear until the hold is lifted. The heading count follows the lane's filters. The shift card's open-ticket count reflects this lane before filters, so the two can differ while a filter is active. [[#client-data]]
**Per-lane query and shared metadata index.** Each lane loads its own tickets from the queues the user belongs to and pages them independently. My tickets, [Needs attention](#dashboard/needs-attention), [Unassigned](#dashboard/unassigned), and [On hold](#dashboard/on-hold) share one metadata index that supplies the heading counts. [View switcher](#dashboard/view-switcher) covers how many tickets a lane shows. The lane has a filter button that uses the tickets page filters. It updates live when a ticket the user has access to changes. [[#failure-states]]
**Encrypted title and fallback display.** Each ticket's title and description are encrypted under a key that belongs to that ticket. That key is wrapped separately for each account permitted to read the ticket. When the key was never wrapped for the signed-in account, the ticket appears with its plaintext fields only.
- Queue
- Priority
- Status
- Times
A placeholder appears where the title would be. [Ticket decryption](#tickets/decryption) covers the wrapping. [[#keys #encryption]]
**Lane query path and cache structure.** Each lane runs a paged infinite query in \`packages/client/src/lib/composables/dashboard/create-dashboard-lane.svelte.ts\`, requesting fifty tickets per page. The server caps a single page at one hundred in \`ticketListInputSchema\` in \`packages/shared/src/schemas/tickets.ts\`. The heading counts and filter option counts draw from the shared metadata index. [Quick actions](#tickets/quick-actions) covers the actions available on each row. [[#client-data]]`)
};

const es_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mis tickets lista los tickets abiertos asignados a la persona usuaria con sesión activa. Un ticket en espera no aparece hasta que se levanta la espera. El conteo del encabezado sigue los filtros del carril. El conteo de tickets abiertos de la tarjeta de turno refleja este carril antes de los filtros, por lo que ambos pueden diferir mientras un filtro está activo. [[#client-data]]
**Consulta por carril e índice de metadatos compartido.** Cada carril carga sus propios tickets de las colas a las que pertenece la persona usuaria y los pagina de forma independiente. Mis tickets, [Necesita atención](#dashboard/needs-attention), [Tickets sin asignar](#dashboard/unassigned) y [Tickets en espera](#dashboard/on-hold) comparten un índice de metadatos que proporciona los conteos de los encabezados. [Selector de vista](#dashboard/view-switcher) explica cuántos tickets muestra un carril. El carril tiene un botón de filtro que usa los filtros de la página de tickets. Se actualiza en vivo cuando cambia un ticket al que la persona usuaria tiene acceso. [[#failure-states]]
**Título cifrado y visualización de respaldo.** El título y la descripción de cada ticket están cifrados con una clave que pertenece a ese ticket. Esa clave se envuelve por separado para cada cuenta con permiso de lectura. Cuando la clave nunca fue envuelta para la cuenta con sesión activa, el ticket aparece solo con sus campos en texto plano.
- Cola
- Prioridad
- Estado
- Tiempos
Un marcador de posición aparece donde estaría el título. [Descifrado de tickets](#tickets/decryption) trata el envolvimiento. [[#keys #encryption]]
**Ruta de consulta del carril y estructura de caché.** Cada carril ejecuta una infinite query paginada en \`packages/client/src/lib/composables/dashboard/create-dashboard-lane.svelte.ts\` y solicita cincuenta tickets por página. El servidor limita una página a cien en \`ticketListInputSchema\` en \`packages/shared/src/schemas/tickets.ts\`. Los conteos de los encabezados y los conteos de opciones de filtro se calculan a partir del índice de metadatos compartido. [Acciones rápidas](#tickets/quick-actions) trata las acciones disponibles en cada fila. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦My tìckèts lìsts òpèn tìckèts àssìgnèd tò thè sìgnèd-ìn ùsèr. À tìckèt òn hòld dòès nòt àppèàr ùntìl thè hòld ìs lìftèd. Thè hèàdìng còùnt fòllòws thè lànè's fìltèrs. Thè shìft càrd's òpèn-tìckèt còùnt rèflècts thìs lànè bèfòrè fìltèrs, sò thè twò càn dìffèr whìlè à fìltèr ìs àctìvè. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèr-lànè qùèry ànd shàrèd mètàdàtà ìndèx. •••••••••••••** Èàch lànè lòàds ìts òwn tìckèts fròm thè qùèùès thè ùsèr bèlòngs tò ànd pàgès thèm ìndèpèndèntly. My tìckèts, [Nèèds àttèntìòn](#dàshbòàrd/nèèds-àttèntìòn), [Ùnàssìgnèd](#dàshbòàrd/ùnàssìgnèd), ànd [Òn hòld](#dàshbòàrd/òn-hòld) shàrè ònè mètàdàtà ìndèx thàt sùpplìès thè hèàdìng còùnts. [Vìèw swìtchèr](#dàshbòàrd/vìèw-swìtchèr) còvèrs hòw màny tìckèts à lànè shòws. Thè lànè hàs à fìltèr bùttòn thàt ùsès thè tìckèts pàgè fìltèrs. Ìt ùpdàtès lìvè whèn à tìckèt thè ùsèr hàs àccèss tò chàngès. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptèd tìtlè ànd fàllbàck dìsplày. ••••••••••••** Èàch tìckèt's tìtlè ànd dèscrìptìòn àrè èncryptèd ùndèr à kèy thàt bèlòngs tò thàt tìckèt. Thàt kèy ìs wràppèd sèpàràtèly fòr èàch àccòùnt pèrmìttèd tò rèàd thè tìckèt. Whèn thè kèy wàs nèvèr wràppèd fòr thè sìgnèd-ìn àccòùnt, thè tìckèt àppèàrs wìth ìts plàìntèxt fìèlds ònly.
- Qùèùè
- Prìòrìty
- Stàtùs
- Tìmès
À plàcèhòldèr àppèàrs whèrè thè tìtlè wòùld bè. [Tìckèt dècryptìòn](#tìckèts/dècryptìòn) còvèrs thè wràppìng. [[#kèys #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Lànè qùèry pàth ànd càchè strùctùrè. •••••••••••** Èàch lànè rùns à pàgèd ìnfìnìtè qùèry ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/dàshbòàrd/crèàtè-dàshbòàrd-lànè.svèltè.ts\`, rèqùèstìng fìfty tìckèts pèr pàgè. Thè sèrvèr càps à sìnglè pàgè àt ònè hùndrèd ìn \`tìckètLìstÌnpùtSchèmà\` ìn \`pàckàgès/shàrèd/src/schèmàs/tìckèts.ts\`. Thè hèàdìng còùnts ànd fìltèr òptìòn còùnts dràw fròm thè shàrèd mètàdàtà ìndèx. [Qùìck àctìòns](#tìckèts/qùìck-àctìòns) còvèrs thè àctìòns àvàìlàblè òn èàch ròw. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "My tickets lists open tickets assigned to the signed-in user. A ticket on hold does not appear until the hold is lifted. The heading count follows the lane's..." |
*
* @param {Demo_Narrative_Dashboard_My_Tickets_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_my_tickets_body = /** @type {((inputs?: Demo_Narrative_Dashboard_My_Tickets_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_My_Tickets_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_my_tickets_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_my_tickets_body(inputs)
	return en_demo_narrative_dashboard_my_tickets_body(inputs)
});