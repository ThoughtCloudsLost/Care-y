/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_My_Tickets_BodyInputs */

const en_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`My tickets lists open tickets assigned to the signed-in user. A ticket on hold does not appear until the hold is lifted. The count beside the heading and the count on the shift line both reflect this list. [[#client-data]]
**Single load across four sections.** The overview page loads up to one hundred open tickets from the queues the user belongs to. One load populates all four sections: My tickets, [Needs attention](#dashboard/needs-attention), [Unassigned](#dashboard/unassigned), and [On hold](#dashboard/on-hold). These are four views of one list, not four separate lookups. When an organization has more than one hundred open tickets, the newest hundred appear. Every other section on this page describes its slice of that same list. [[#failure-states]]
**Encrypted title and fallback display.** Each ticket's title and description are encrypted under a key that belongs to that ticket. That key is wrapped separately for each account permitted to read the ticket. When the key was never wrapped for the signed-in account, the ticket appears with its plaintext fields only: queue, priority, status, and times. A placeholder appears where the title would be. [Ticket decryption](#tickets/decryption) covers the wrapping. [[#keys #encryption]]
**Query shape and cache structure.** The request is a single-page infinite query in \`packages/client/src/routes/(app)/+page.svelte\`. The quick-action composables shared with the tickets list need to operate on a single cache shape. The infinite-query structure satisfies that. The ceiling of one hundred is set in \`ticketListInputSchema\` in \`packages/shared/src/schemas/tickets.ts\`. Sorting into sections is handled by \`bucketTickets\` in \`packages/client/src/lib/components/dashboard/filters.ts\` in one pass over the result. [Quick actions](#tickets/quick-actions) covers the actions available on each row. [[#client-data]]`)
};

const es_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mis tickets lista los tickets abiertos asignados al usuario con sesión activa. Un ticket en espera no aparece hasta que se levanta la espera. El conteo junto al encabezado y el conteo en la línea de turno reflejan esta lista. [[#client-data]]
**Carga única en cuatro secciones.** La página de resumen carga hasta cien tickets abiertos de las colas a las que pertenece el usuario. Una sola carga llena las cuatro secciones: Mis tickets, [Necesita atención](#dashboard/needs-attention), [Tickets sin asignar](#dashboard/unassigned) y [Tickets en espera](#dashboard/on-hold). Son cuatro vistas de una misma lista, no cuatro consultas separadas. Cuando una organización tiene más de cien tickets abiertos, aparecen los cien más recientes. Cada otra sección en esta página describe su porción de esa misma lista. [[#failure-states]]
**Título cifrado y visualización de respaldo.** El título y la descripción de cada ticket están cifrados con una clave que pertenece a ese ticket. Esa clave se envuelve por separado para cada cuenta con permiso de lectura. Cuando la clave nunca fue envuelta para la cuenta con sesión activa, el ticket aparece solo con sus campos en texto plano: cola, prioridad, estado y tiempos. Un marcador de posición aparece donde estaría el título. [Descifrado de tickets](#tickets/decryption) cubre el envolvimiento. [[#keys #encryption]]
**Forma de la consulta y estructura de caché.** La solicitud es una infinite query de página única en \`packages/client/src/routes/(app)/+page.svelte\`. Los composables de acciones rápidas compartidos con la lista de tickets necesitan operar sobre una sola forma de caché. La estructura de infinite query satisface eso. El tope de cien se establece en \`ticketListInputSchema\` en \`packages/shared/src/schemas/tickets.ts\`. La clasificación en secciones la realiza \`bucketTickets\` en \`packages/client/src/lib/components/dashboard/filters.ts\` en una sola pasada sobre el resultado. [Acciones rápidas](#tickets/quick-actions) cubre las acciones disponibles en cada fila. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_my_tickets_body = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦My tìckèts lìsts òpèn tìckèts àssìgnèd tò thè sìgnèd-ìn ùsèr. À tìckèt òn hòld dòès nòt àppèàr ùntìl thè hòld ìs lìftèd. Thè còùnt bèsìdè thè hèàdìng ànd thè còùnt òn thè shìft lìnè bòth rèflèct thìs lìst. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sìnglè lòàd àcròss fòùr sèctìòns. ••••••••••** Thè òvèrvìèw pàgè lòàds ùp tò ònè hùndrèd òpèn tìckèts fròm thè qùèùès thè ùsèr bèlòngs tò. Ònè lòàd pòpùlàtès àll fòùr sèctìòns: My tìckèts, [Nèèds àttèntìòn](#dàshbòàrd/nèèds-àttèntìòn), [Ùnàssìgnèd](#dàshbòàrd/ùnàssìgnèd), ànd [Òn hòld](#dàshbòàrd/òn-hòld). Thèsè àrè fòùr vìèws òf ònè lìst, nòt fòùr sèpàràtè lòòkùps. Whèn àn òrgànìzàtìòn hàs mòrè thàn ònè hùndrèd òpèn tìckèts, thè nèwèst hùndrèd àppèàr. Èvèry òthèr sèctìòn òn thìs pàgè dèscrìbès ìts slìcè òf thàt sàmè lìst. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptèd tìtlè ànd fàllbàck dìsplày. ••••••••••••** Èàch tìckèt's tìtlè ànd dèscrìptìòn àrè èncryptèd ùndèr à kèy thàt bèlòngs tò thàt tìckèt. Thàt kèy ìs wràppèd sèpàràtèly fòr èàch àccòùnt pèrmìttèd tò rèàd thè tìckèt. Whèn thè kèy wàs nèvèr wràppèd fòr thè sìgnèd-ìn àccòùnt, thè tìckèt àppèàrs wìth ìts plàìntèxt fìèlds ònly: qùèùè, prìòrìty, stàtùs, ànd tìmès. À plàcèhòldèr àppèàrs whèrè thè tìtlè wòùld bè. [Tìckèt dècryptìòn](#tìckèts/dècryptìòn) còvèrs thè wràppìng. [[#kèys #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Qùèry shàpè ànd càchè strùctùrè. ••••••••••** Thè rèqùèst ìs à sìnglè-pàgè ìnfìnìtè qùèry ìn \`pàckàgès/clìènt/src/ròùtès/(àpp)/+pàgè.svèltè\`. Thè qùìck-àctìòn còmpòsàblès shàrèd wìth thè tìckèts lìst nèèd tò òpèràtè òn à sìnglè càchè shàpè. Thè ìnfìnìtè-qùèry strùctùrè sàtìsfìès thàt. Thè cèìlìng òf ònè hùndrèd ìs sèt ìn \`tìckètLìstÌnpùtSchèmà\` ìn \`pàckàgès/shàrèd/src/schèmàs/tìckèts.ts\`. Sòrtìng ìntò sèctìòns ìs hàndlèd by \`bùckètTìckèts\` ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/dàshbòàrd/fìltèrs.ts\` ìn ònè pàss òvèr thè rèsùlt. [Qùìck àctìòns](#tìckèts/qùìck-àctìòns) còvèrs thè àctìòns àvàìlàblè òn èàch ròw. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "My tickets lists open tickets assigned to the signed-in user. A ticket on hold does not appear until the hold is lifted. The count beside the heading and the..." |
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