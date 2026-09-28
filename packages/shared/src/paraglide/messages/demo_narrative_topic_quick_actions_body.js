/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Quick_Actions_BodyInputs */

const en_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quick actions are the common operations on a ticket, run without opening it. Rows in the ticket list carry them as a swipe gesture and cards carry them as buttons. [[#client-data]]
**Swipe gestures.** Pulling a row to the right offers reply and call. Pulling left offers assign and hold. Which action a released pull runs depends on how far it went. A pull can also be stopped short to leave that direction's buttons open for a tap. Only one row holds an open tray at a time; any new interaction on another row dismisses it. A long press selects the row for a bulk action instead. [Bulk selection](#tickets/select-mode) covers that path. [[#client-data]]
**Card actions.** Cards carry reply, call, hold or release from hold, and either take when nobody is assigned or assign when somebody is. [[#client-data]]
**Who can do what?** Hold goes through the ticket update mutation, gated on permission to change case status. Assign is gated on permission to assign cases. Take and release are gated on permission to claim cases. On top of every gate, the account must be the ticket's assignee, a watcher on it, or a member of its queue; anything else is refused as a permission error. [[#permissions]]
**What does each action write?** Holding writes the hold flag and assigning or taking writes the assignee, both plaintext columns on the ticket row. Each of the three writes a system event into the ticket's timeline. A reply opens a reply sheet over the list, and the message is sealed in the browser before it is sent. [Sending a reply](#ticket-detail/reply) covers what a reply carries. [[#encryption #permissions]]
**What happens when the server refuses?** The list changes immediately when an action runs. If the server refuses, the change reverts and an error message appears; the message does not name the missing permission. [[#failure-states]]
**The swipe component and action composables.** \`SwipeableCard.svelte\` in \`packages/client/src/lib/components/tickets/\` owns the release bands and the one-open-tray rule. Each action is a composable in \`packages/client/src/lib/composables/ticket-list/\`, shared with the overview's rows. The reply flow is \`create-reply-flow.svelte.ts\`, which opens a \`ReplySheet\` rather than the ticket detail's inline compose bar. [My tickets](#dashboard/my-tickets) covers those rows. [[#client-data]]`)
};

const es_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las acciones rápidas son las operaciones comunes sobre un ticket, ejecutadas sin abrirlo. Las filas en la lista de tickets las ofrecen como gesto de deslizamiento y las tarjetas las ofrecen como botones. [[#client-data]]
**Gestos de deslizamiento.** Deslizar una fila hacia la derecha ofrece responder y llamar. Deslizar hacia la izquierda ofrece asignar y poner en espera. La acción que ejecuta un tirón soltado depende de la distancia recorrida. Un tirón también puede detenerse antes para dejar los botones de esa dirección abiertos y pulsar uno. Solo una fila mantiene la bandeja abierta a la vez; cualquier interacción en otra fila la cierra. Una pulsación larga selecciona la fila para una acción masiva. [Selección masiva](#tickets/select-mode) cubre esa vía. [[#client-data]]
**Acciones en tarjetas.** Las tarjetas incluyen responder, llamar, poner en espera o quitar de espera, y tomar cuando nadie está asignado o asignar cuando alguien lo está. [[#client-data]]
**¿Quién puede hacer qué?** Poner en espera pasa por la mutación de actualización de ticket, controlada por el permiso para cambiar el estado del caso. Asignar requiere el permiso para asignar casos. Tomar y liberar requieren el permiso para reclamar casos. Sobre cada permiso, la cuenta debe ser el asignado del ticket, un observador del mismo o miembro de su cola; cualquier otra situación se rechaza como error de permisos. [[#permissions]]
**¿Qué escribe cada acción?** Poner en espera escribe la marca de espera y asignar o tomar escribe el asignado, ambas columnas de texto plano en la fila del ticket. Cada una de las tres escribe un evento de sistema en la línea de tiempo del ticket. Una respuesta abre una hoja de respuesta sobre la lista, y el mensaje se cifra en el navegador antes del envío. [Enviando una respuesta](#ticket-detail/reply) cubre lo que incluye una respuesta. [[#encryption #permissions]]
**¿Qué pasa cuando el servidor rechaza?** La lista cambia de inmediato cuando se ejecuta una acción. Si el servidor rechaza la operación, el cambio se revierte y aparece un mensaje de error; el mensaje no nombra el permiso faltante. [[#failure-states]]
**El componente de deslizamiento y los composables de acción.** \`SwipeableCard.svelte\` en \`packages/client/src/lib/components/tickets/\` controla las bandas de liberación y la regla de una sola bandeja abierta. Cada acción es un composable en \`packages/client/src/lib/composables/ticket-list/\`, compartido con las filas del panel principal. El flujo de respuesta es \`create-reply-flow.svelte.ts\`, que abre un \`ReplySheet\` en lugar de la barra de composición integrada del detalle del ticket. [Mis tickets](#dashboard/my-tickets) cubre esas filas. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùìck àctìòns àrè thè còmmòn òpèràtìòns òn à tìckèt, rùn wìthòùt òpènìng ìt. Ròws ìn thè tìckèt lìst càrry thèm às à swìpè gèstùrè ànd càrds càrry thèm às bùttòns. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Swìpè gèstùrès. •••••** Pùllìng à ròw tò thè rìght òffèrs rèply ànd càll. Pùllìng lèft òffèrs àssìgn ànd hòld. Whìch àctìòn à rèlèàsèd pùll rùns dèpènds òn hòw fàr ìt wènt. À pùll càn àlsò bè stòppèd shòrt tò lèàvè thàt dìrèctìòn's bùttòns òpèn fòr à tàp. Ònly ònè ròw hòlds àn òpèn trày àt à tìmè; àny nèw ìntèràctìòn òn ànòthèr ròw dìsmìssès ìt. À lòng prèss sèlècts thè ròw fòr à bùlk àctìòn ìnstèàd. [Bùlk sèlèctìòn](#tìckèts/sèlèct-mòdè) còvèrs thàt pàth. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Càrd àctìòns. ••••** Càrds càrry rèply, càll, hòld òr rèlèàsè fròm hòld, ànd èìthèr tàkè whèn nòbòdy ìs àssìgnèd òr àssìgn whèn sòmèbòdy ìs. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••**Whò càn dò whàt? •••••** Hòld gòès thròùgh thè tìckèt ùpdàtè mùtàtìòn, gàtèd òn pèrmìssìòn tò chàngè càsè stàtùs. Àssìgn ìs gàtèd òn pèrmìssìòn tò àssìgn càsès. Tàkè ànd rèlèàsè àrè gàtèd òn pèrmìssìòn tò clàìm càsès. Òn tòp òf èvèry gàtè, thè àccòùnt mùst bè thè tìckèt's àssìgnèè, à wàtchèr òn ìt, òr à mèmbèr òf ìts qùèùè; ànythìng èlsè ìs rèfùsèd às à pèrmìssìòn èrròr. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès èàch àctìòn wrìtè? •••••••••** Hòldìng wrìtès thè hòld flàg ànd àssìgnìng òr tàkìng wrìtès thè àssìgnèè, bòth plàìntèxt còlùmns òn thè tìckèt ròw. Èàch òf thè thrèè wrìtès à systèm èvènt ìntò thè tìckèt's tìmèlìnè. À rèply òpèns à rèply shèèt òvèr thè lìst, ànd thè mèssàgè ìs sèàlèd ìn thè bròwsèr bèfòrè ìt ìs sènt. [Sèndìng à rèply](#tìckèt-dètàìl/rèply) còvèrs whàt à rèply càrrìès. [[#èncryptìòn #pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns whèn thè sèrvèr rèfùsès? ••••••••••••** Thè lìst chàngès ìmmèdìàtèly whèn àn àctìòn rùns. Ìf thè sèrvèr rèfùsès, thè chàngè rèvèrts ànd àn èrròr mèssàgè àppèàrs; thè mèssàgè dòès nòt nàmè thè mìssìng pèrmìssìòn. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè swìpè còmpònènt ànd àctìòn còmpòsàblès. •••••••••••••** \`SwìpèàblèCàrd.svèltè\` ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/tìckèts/\` òwns thè rèlèàsè bànds ànd thè ònè-òpèn-trày rùlè. Èàch àctìòn ìs à còmpòsàblè ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-lìst/\`, shàrèd wìth thè òvèrvìèw's ròws. Thè rèply flòw ìs \`crèàtè-rèply-flòw.svèltè.ts\`, whìch òpèns à \`RèplyShèèt\` ràthèr thàn thè tìckèt dètàìl's ìnlìnè còmpòsè bàr. [My tìckèts](#dàshbòàrd/my-tìckèts) còvèrs thòsè ròws. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Quick actions are the common operations on a ticket, run without opening it. Rows in the ticket list carry them as a swipe gesture and cards carry them as bu..." |
*
* @param {Demo_Narrative_Topic_Quick_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_quick_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Quick_Actions_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Quick_Actions_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_quick_actions_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_quick_actions_body(inputs)
	return en_demo_narrative_topic_quick_actions_body(inputs)
});