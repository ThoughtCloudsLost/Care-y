/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_View_Modes_BodyInputs */

const en_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The ticket list's "View as" switcher offers Table, Compact rows, Cards, Grid, and Kanban board. The overview page keeps its own view-mode preference, covered in [The view switcher](#dashboard/view-switcher). [[#client-data]]
**Preview loading and server visibility.** Every mode decrypts ticket titles in the browser. Table and Compact rows request no message previews. Cards, Grid, and Kanban board load each ticket's most recent messages as its card scrolls into view and decrypt them in the browser. To request previews, the browser must tell the server which tickets it is asking about, so the server can see which tickets a given browser requested previews for. The decryption step itself is covered in [Ticket decryption](#tickets/decryption). [[#metadata #server-holds]]
**Mode layouts.**
- Table shows one ticket per row with labeled columns: Status, Priority, Client, Title, Queue, Assignee, Activity, and Follow-ups. Narrower screens drop Queue, Assignee, Activity, and Follow-ups as width shrinks. Table fits the most tickets on screen at once with the most detail per ticket.
- Compact rows shows one ticket per line with no message preview, so more tickets fit on screen than the card modes.
- Cards shows one full-width card per ticket with the ticket's most recent messages.
- Grid arranges the same cards in multiple columns, at least two.
- Kanban board arranges cards in the Grid style in columns by workflow stage and adds actions for moving tickets through those stages; [Kanban board](#tickets/kanban-board) covers stages, auto-move, and configuration. [[#client-data]]
**Mode persistence and list rendering.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` holds the ticket list mode under the localStorage key \`care-y-view-mode\`, using the load-validate-write primitive in \`persisted-state.svelte.ts\`. Rendering splits by mode. Table windows its rows by dividing scroll position by a uniform row pitch in \`packages/client/src/lib/components/tickets/ticket-table-window.ts\` and starts virtualizing at 200 rows in \`TicketTable.svelte\`. The other modes render through \`VirtualList.svelte\`, which measures each card, starts virtualizing at 500 items once at least 20 rows have been measured, and lays Grid out at no fewer than two columns. [[#client-data]]`)
};

const es_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El selector «Ver como» de la lista de tickets ofrece Tabla, Filas compactas, Tarjetas, Cuadrícula y Tablero kanban. La página de resumen mantiene su propia preferencia de modo de vista, descrita en [El selector de vista](#dashboard/view-switcher). [[#client-data]]
**Carga de vistas previas y visibilidad del servidor.** Todos los modos descifran los títulos de los tickets en el navegador. Tabla y Filas compactas no solicitan vistas previas de mensajes. Tarjetas, Cuadrícula y Tablero kanban cargan los mensajes más recientes de cada ticket a medida que su tarjeta aparece a la vista y los descifran en el navegador. Para solicitar vistas previas, el navegador debe indicar al servidor qué tickets consulta, de modo que el servidor puede ver qué tickets solicitó un navegador dado. El paso de descifrado se describe en [Descifrado de tickets](#tickets/decryption). [[#metadata #server-holds]]
**Disposición por modo.**
- Tabla muestra un ticket por fila con columnas etiquetadas: Estado, Prioridad, Cliente, Título, Cola, Asignado, Actividad y Seguimientos. Las pantallas más estrechas ocultan Cola, Asignado, Actividad y Seguimientos a medida que el ancho se reduce. Tabla muestra la mayor cantidad de tickets en pantalla a la vez con el mayor detalle por ticket.
- Filas compactas muestra un ticket por línea sin vista previa de mensajes, por lo que caben más tickets en pantalla que en los modos de tarjeta.
- Tarjetas muestra una tarjeta a ancho completo por ticket con los mensajes más recientes del ticket.
- Cuadrícula dispone las mismas tarjetas en varias columnas, al menos dos.
- Tablero kanban dispone tarjetas con el estilo de Cuadrícula en columnas por etapa de flujo de trabajo y agrega acciones para mover tickets entre esas etapas; [Tablero kanban](#tickets/kanban-board) cubre etapas, avance automático y configuración. [[#client-data]]
**Persistencia de modo y renderizado de lista.** \`packages/client/src/lib/stores/view-mode.svelte.ts\` almacena el modo de la lista de tickets bajo la clave localStorage \`care-y-view-mode\`, mediante la primitiva de carga-validación-escritura en \`persisted-state.svelte.ts\`. El renderizado se reparte por modo. Tabla acota sus filas dividiendo la posición de desplazamiento entre un paso de fila uniforme en \`packages/client/src/lib/components/tickets/ticket-table-window.ts\` y empieza a virtualizar a partir de 200 filas en \`TicketTable.svelte\`. Los demás modos se renderizan a través de \`VirtualList.svelte\`, que mide cada tarjeta, empieza a virtualizar a partir de 500 elementos una vez medidas al menos 20 filas, y dispone Cuadrícula en un mínimo de dos columnas. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìckèt lìst's "Vìèw às" swìtchèr òffèrs Tàblè, Còmpàct ròws, Càrds, Grìd, ànd Kànbàn bòàrd. Thè òvèrvìèw pàgè kèèps ìts òwn vìèw-mòdè prèfèrèncè, còvèrèd ìn [Thè vìèw swìtchèr](#dàshbòàrd/vìèw-swìtchèr). [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Prèvìèw lòàdìng ànd sèrvèr vìsìbìlìty. ••••••••••••** Èvèry mòdè dècrypts tìckèt tìtlès ìn thè bròwsèr. Tàblè ànd Còmpàct ròws rèqùèst nò mèssàgè prèvìèws. Càrds, Grìd, ànd Kànbàn bòàrd lòàd èàch tìckèt's mòst rècènt mèssàgès às ìts càrd scròlls ìntò vìèw ànd dècrypt thèm ìn thè bròwsèr. Tò rèqùèst prèvìèws, thè bròwsèr mùst tèll thè sèrvèr whìch tìckèts ìt ìs àskìng àbòùt, sò thè sèrvèr càn sèè whìch tìckèts à gìvèn bròwsèr rèqùèstèd prèvìèws fòr. Thè dècryptìòn stèp ìtsèlf ìs còvèrèd ìn [Tìckèt dècryptìòn](#tìckèts/dècryptìòn). [[#mètàdàtà #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Mòdè làyòùts. ••••**
- Tàblè shòws ònè tìckèt pèr ròw wìth làbèlèd còlùmns: Stàtùs, Prìòrìty, Clìènt, Tìtlè, Qùèùè, Àssìgnèè, Àctìvìty, ànd Fòllòw-ùps. Nàrròwèr scrèèns dròp Qùèùè, Àssìgnèè, Àctìvìty, ànd Fòllòw-ùps às wìdth shrìnks. Tàblè fìts thè mòst tìckèts òn scrèèn àt òncè wìth thè mòst dètàìl pèr tìckèt.
- Còmpàct ròws shòws ònè tìckèt pèr lìnè wìth nò mèssàgè prèvìèw, sò mòrè tìckèts fìt òn scrèèn thàn thè càrd mòdès.
- Càrds shòws ònè fùll-wìdth càrd pèr tìckèt wìth thè tìckèt's mòst rècènt mèssàgès.
- Grìd àrràngès thè sàmè càrds ìn mùltìplè còlùmns, àt lèàst twò.
- Kànbàn bòàrd àrràngès càrds ìn thè Grìd stylè ìn còlùmns by wòrkflòw stàgè ànd àdds àctìòns fòr mòvìng tìckèts thròùgh thòsè stàgès; [Kànbàn bòàrd](#tìckèts/kànbàn-bòàrd) còvèrs stàgès, àùtò-mòvè, ànd cònfìgùràtìòn. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Mòdè pèrsìstèncè ànd lìst rèndèrìng. •••••••••••** \`pàckàgès/clìènt/src/lìb/stòrès/vìèw-mòdè.svèltè.ts\` hòlds thè tìckèt lìst mòdè ùndèr thè lòcàlStòràgè kèy \`càrè-y-vìèw-mòdè\`, ùsìng thè lòàd-vàlìdàtè-wrìtè prìmìtìvè ìn \`pèrsìstèd-stàtè.svèltè.ts\`. Rèndèrìng splìts by mòdè. Tàblè wìndòws ìts ròws by dìvìdìng scròll pòsìtìòn by à ùnìfòrm ròw pìtch ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/tìckèts/tìckèt-tàblè-wìndòw.ts\` ànd stàrts vìrtùàlìzìng àt 200 ròws ìn \`TìckètTàblè.svèltè\`. Thè òthèr mòdès rèndèr thròùgh \`VìrtùàlLìst.svèltè\`, whìch mèàsùrès èàch càrd, stàrts vìrtùàlìzìng àt 500 ìtèms òncè àt lèàst 20 ròws hàvè bèèn mèàsùrèd, ànd làys Grìd òùt àt nò fèwèr thàn twò còlùmns. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The ticket list's \"View as\" switcher offers Table, Compact rows, Cards, Grid, and Kanban board. The overview page keeps its own view-mode preference, covered..." |
*
* @param {Demo_Narrative_Topic_View_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_body = /** @type {((inputs?: Demo_Narrative_Topic_View_Modes_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_View_Modes_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_view_modes_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_view_modes_body(inputs)
	return en_demo_narrative_topic_view_modes_body(inputs)
});