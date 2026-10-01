/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_On_Hold_BodyInputs */

const en_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This section lists every on-hold ticket from the queues the signed-in user belongs to, regardless of who placed the hold. In the stacked layout the section disappears when no ticket qualifies and no filter is active; side by side it keeps its place. The lane has a filter button that uses the tickets page filters. [View switcher](#dashboard/view-switcher) covers how many tickets a lane shows. [[#client-data]]
**What does a hold record?** The hold is a plaintext boolean on the ticket row, alongside the queue, the status, the priority, the assignee, and the creation time. A database dump shows how many tickets an organization has on hold and in which queues. It shows nothing about why any of them is waiting, because the reason lives in the encrypted thread. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns across the schema. [[#server-holds #metadata]]
**Setting and clearing.** A hold is set or cleared from the ticket detail actions or from a row's [quick actions](#tickets/quick-actions) on the overview or the tickets list. Closing a ticket clears its hold. A ticket is never both held and closed; On hold, New, Active and Closed divide every ticket between them. Clearing the hold returns the ticket to whichever section its assignment and status put it in. [[#client-data]]
**The column and the update path.** \`on_hold\` is a column on \`tickets\` in \`packages/server/src/db/migrations/tenant/001_baseline.ts\` with a false default. The mutation is \`tickets.update\` with an \`onHold\` field, driven by \`createHoldAction\` in \`packages/client/src/lib/composables/ticket-list/create-hold-action.svelte.ts\` on the overview and the tickets list, and by \`create-panel-actions.svelte.ts\` on the ticket detail. [[#client-data]]`)
};

const es_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta sección lista todos los tickets en espera de las colas a las que pertenece la persona usuaria, sin importar quién puso la espera. En la disposición apilada la sección desaparece cuando ningún ticket cumple la condición y no hay un filtro activo; en la disposición en paralelo conserva su lugar. El carril tiene un botón de filtro que usa los filtros de la página de tickets. [Selector de vista](#dashboard/view-switcher) explica cuántos tickets muestra un carril. [[#client-data]]
**¿Qué registra una espera?** La espera es un booleano en texto plano en la fila del ticket, junto a la cola, el estado, la prioridad, la persona asignada y la fecha de creación. Un volcado de la base de datos muestra cuántos tickets tiene en espera una organización y en qué colas están. No muestra nada sobre por qué espera cada uno, porque el motivo vive en el hilo cifrado. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano de todo el esquema. [[#server-holds #metadata]]
**Poner y quitar la espera.** La espera se pone o se quita desde las acciones del detalle del ticket o desde las [acciones rápidas](#tickets/quick-actions) de la fila en el resumen o en la lista de tickets. Cerrar un ticket quita su espera. Un ticket nunca está en espera y cerrado a la vez; En espera, Nuevo, Activo y Cerrado dividen todos los tickets entre sí. Quitar la espera devuelve el ticket a la sección que le corresponda según su asignación y estado. [[#client-data]]
**La columna y la ruta de actualización.** \`on_hold\` es una columna de \`tickets\`, en \`packages/server/src/db/migrations/tenant/001_baseline.ts\`, con un valor por defecto de falso. La mutación es \`tickets.update\` con un campo \`onHold\`, accionada por \`createHoldAction\` en \`packages/client/src/lib/composables/ticket-list/create-hold-action.svelte.ts\` en el resumen y la lista de tickets, y por \`create-panel-actions.svelte.ts\` en el detalle del ticket. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs sèctìòn lìsts èvèry òn-hòld tìckèt fròm thè qùèùès thè sìgnèd-ìn ùsèr bèlòngs tò, règàrdlèss òf whò plàcèd thè hòld. Ìn thè stàckèd làyòùt thè sèctìòn dìsàppèàrs whèn nò tìckèt qùàlìfìès ànd nò fìltèr ìs àctìvè; sìdè by sìdè ìt kèèps ìts plàcè. Thè lànè hàs à fìltèr bùttòn thàt ùsès thè tìckèts pàgè fìltèrs. [Vìèw swìtchèr](#dàshbòàrd/vìèw-swìtchèr) còvèrs hòw màny tìckèts à lànè shòws. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à hòld rècòrd? ••••••••** Thè hòld ìs à plàìntèxt bòòlèàn òn thè tìckèt ròw, àlòngsìdè thè qùèùè, thè stàtùs, thè prìòrìty, thè àssìgnèè, ànd thè crèàtìòn tìmè. À dàtàbàsè dùmp shòws hòw màny tìckèts àn òrgànìzàtìòn hàs òn hòld ànd ìn whìch qùèùès. Ìt shòws nòthìng àbòùt why àny òf thèm ìs wàìtìng, bècàùsè thè rèàsòn lìvès ìn thè èncryptèd thrèàd. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs thè plàìntèxt còlùmns àcròss thè schèmà. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sèttìng ànd clèàrìng. •••••••** À hòld ìs sèt òr clèàrèd fròm thè tìckèt dètàìl àctìòns òr fròm à ròw's [qùìck àctìòns](#tìckèts/qùìck-àctìòns) òn thè òvèrvìèw òr thè tìckèts lìst. Clòsìng à tìckèt clèàrs ìts hòld. À tìckèt ìs nèvèr bòth hèld ànd clòsèd; Òn hòld, Nèw, Àctìvè ànd Clòsèd dìvìdè èvèry tìckèt bètwèèn thèm. Clèàrìng thè hòld rètùrns thè tìckèt tò whìchèvèr sèctìòn ìts àssìgnmènt ànd stàtùs pùt ìt ìn. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè còlùmn ànd thè ùpdàtè pàth. ••••••••••** \`òn_hòld\` ìs à còlùmn òn \`tìckèts\` ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\` wìth à fàlsè dèfàùlt. Thè mùtàtìòn ìs \`tìckèts.ùpdàtè\` wìth àn \`ònHòld\` fìèld, drìvèn by \`crèàtèHòldÀctìòn\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-lìst/crèàtè-hòld-àctìòn.svèltè.ts\` òn thè òvèrvìèw ànd thè tìckèts lìst, ànd by \`crèàtè-pànèl-àctìòns.svèltè.ts\` òn thè tìckèt dètàìl. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This section lists every on-hold ticket from the queues the signed-in user belongs to, regardless of who placed the hold. In the stacked layout the section d..." |
*
* @param {Demo_Narrative_Dashboard_On_Hold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_on_hold_body = /** @type {((inputs?: Demo_Narrative_Dashboard_On_Hold_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_On_Hold_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_on_hold_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_on_hold_body(inputs)
	return en_demo_narrative_dashboard_on_hold_body(inputs)
});