/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Date_Separators_BodyInputs */

const en_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A date separator marks each change of day in the thread, and a separate line marks where reading stopped last time. One component draws both lines on both threads: the ticket thread and the client's portal thread. A client and an account reading the same conversation see the day boundaries in the same places. [[#client-data]]
**How does the browser decide the day boundary?** Two follow-ups fall on different days when their timestamps fall on different calendar dates in the device's time zone. The browser computes this from the timestamps it already holds, with no server input. An account on a device set to a different time zone sees different day boundaries. [[#failure-states #privacy]]
**Where does the unread line come from?** The line is read from an encrypted read cursor per account per ticket, sealed with the ticket key. The read cursor records the last position read. Writing a read cursor tells the server that an account opened the ticket, which is why the ticket list never writes one. [Unread badges](#tickets/unread-badges) covers the read cursor's encryption, its indistinguishability from a first-open decoy, and the sweep that turns cursors into counts. [[#encryption #server-holds #metadata]]
**Debounce and deletion.** The read cursor is held in memory for a few seconds and written once, rather than after every follow-up the account scrolls past. Closing a ticket deletes every account's read cursor for it. Reopening does not restore them, so a closed ticket carries no record of who read how far. [Closing and reopening](#ticket-detail/close-reopen) covers what else a close removes. [[#retention #privacy]]
**The separator and cursor services.** \`formatDateSeparator\` and \`needsDateSeparator\` in \`packages/client/src/lib/utils/time.ts\` decide when a break is needed and format its label. \`DateSeparator.svelte\` draws the break on both threads. The cursor is handled by \`create-read-cursor.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` against \`packages/server/src/tickets/read-cursor-service.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un separador de fecha marca cada cambio de día en el hilo, y una línea aparte marca dónde se dejó de leer la última vez. Un solo componente dibuja ambas líneas en ambos hilos: el hilo del ticket y el hilo del portal del cliente. El cliente y una cuenta que leen la misma conversación ven los límites de día en los mismos lugares. [[#client-data]]
**¿Cómo decide el navegador el límite de día?** Dos seguimientos caen en días diferentes cuando sus marcas de tiempo caen en fechas de calendario diferentes en la zona horaria del dispositivo. El navegador lo calcula a partir de las marcas de tiempo que ya tiene, sin intervención del servidor. Una cuenta en un dispositivo con otra zona horaria ve límites de día diferentes. [[#failure-states #privacy]]
**¿De dónde sale la línea de no leídos?** La línea se lee de un cursor de lectura cifrado por cuenta y por ticket, sellado con la clave del ticket. El cursor de lectura registra la última posición leída. Escribir un cursor de lectura le indica al servidor que una cuenta abrió el ticket, por eso la lista de tickets nunca escribe uno. [Insignias de no leídos](#tickets/unread-badges) trata el cifrado del cursor de lectura, su indistinguibilidad de un señuelo de primera apertura y el barrido que convierte los cursores en conteos. [[#encryption #server-holds #metadata]]
**Antirrebote y eliminación.** El cursor de lectura se retiene en memoria unos segundos y se escribe una sola vez, en lugar de después de cada seguimiento que la cuenta recorre. Cerrar un ticket elimina el cursor de lectura de cada cuenta. Reabrirlo no los restaura, de modo que un ticket cerrado no conserva registro de quién leyó hasta dónde. [Cerrar y reabrir](#ticket-detail/close-reopen) trata lo que un cierre elimina además de esto. [[#retention #privacy]]
**Los servicios de separador y cursor.** \`formatDateSeparator\` y \`needsDateSeparator\` en \`packages/client/src/lib/utils/time.ts\` deciden cuándo hace falta un corte y le dan formato a su etiqueta. \`DateSeparator.svelte\` dibuja el corte en ambos hilos. El cursor lo gestiona \`create-read-cursor.svelte.ts\` en \`packages/client/src/lib/composables/ticket-detail/\` contra \`packages/server/src/tickets/read-cursor-service.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À dàtè sèpàràtòr màrks èàch chàngè òf dày ìn thè thrèàd, ànd à sèpàràtè lìnè màrks whèrè rèàdìng stòppèd làst tìmè. Ònè còmpònènt dràws bòth lìnès òn bòth thrèàds: thè tìckèt thrèàd ànd thè clìènt's pòrtàl thrèàd. À clìènt ànd àn àccòùnt rèàdìng thè sàmè cònvèrsàtìòn sèè thè dày bòùndàrìès ìn thè sàmè plàcès. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw dòès thè bròwsèr dècìdè thè dày bòùndàry? ••••••••••••••** Twò fòllòw-ùps fàll òn dìffèrènt dàys whèn thèìr tìmèstàmps fàll òn dìffèrènt càlèndàr dàtès ìn thè dèvìcè's tìmè zònè. Thè bròwsèr còmpùtès thìs fròm thè tìmèstàmps ìt àlrèàdy hòlds, wìth nò sèrvèr ìnpùt. Àn àccòùnt òn à dèvìcè sèt tò à dìffèrènt tìmè zònè sèès dìffèrènt dày bòùndàrìès. [[#fàìlùrè-stàtès #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè dòès thè ùnrèàd lìnè còmè fròm? ••••••••••••** Thè lìnè ìs rèàd fròm àn èncryptèd rèàd cùrsòr pèr àccòùnt pèr tìckèt, sèàlèd wìth thè tìckèt kèy. Thè rèàd cùrsòr rècòrds thè làst pòsìtìòn rèàd. Wrìtìng à rèàd cùrsòr tèlls thè sèrvèr thàt àn àccòùnt òpènèd thè tìckèt, whìch ìs why thè tìckèt lìst nèvèr wrìtès ònè. [Ùnrèàd bàdgès](#tìckèts/ùnrèàd-bàdgès) còvèrs thè rèàd cùrsòr's èncryptìòn, ìts ìndìstìngùìshàbìlìty fròm à fìrst-òpèn dècòy, ànd thè swèèp thàt tùrns cùrsòrs ìntò còùnts. [[#èncryptìòn #sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèbòùncè ànd dèlètìòn. •••••••** Thè rèàd cùrsòr ìs hèld ìn mèmòry fòr à fèw sècònds ànd wrìttèn òncè, ràthèr thàn àftèr èvèry fòllòw-ùp thè àccòùnt scròlls pàst. Clòsìng à tìckèt dèlètès èvèry àccòùnt's rèàd cùrsòr fòr ìt. Rèòpènìng dòès nòt rèstòrè thèm, sò à clòsèd tìckèt càrrìès nò rècòrd òf whò rèàd hòw fàr. [Clòsìng ànd rèòpènìng](#tìckèt-dètàìl/clòsè-rèòpèn) còvèrs whàt èlsè à clòsè rèmòvès. [[#rètèntìòn #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè sèpàràtòr ànd cùrsòr sèrvìcès. •••••••••••** \`fòrmàtDàtèSèpàràtòr\` ànd \`nèèdsDàtèSèpàràtòr\` ìn \`pàckàgès/clìènt/src/lìb/ùtìls/tìmè.ts\` dècìdè whèn à brèàk ìs nèèdèd ànd fòrmàt ìts làbèl. \`DàtèSèpàràtòr.svèltè\` dràws thè brèàk òn bòth thrèàds. Thè cùrsòr ìs hàndlèd by \`crèàtè-rèàd-cùrsòr.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\` àgàìnst \`pàckàgès/sèrvèr/src/tìckèts/rèàd-cùrsòr-sèrvìcè.ts\`. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A date separator marks each change of day in the thread, and a separate line marks where reading stopped last time. One component draws both lines on both th..." |
*
* @param {Demo_Narrative_Topic_Date_Separators_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_date_separators_body = /** @type {((inputs?: Demo_Narrative_Topic_Date_Separators_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Date_Separators_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_date_separators_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_date_separators_body(inputs)
	return en_demo_narrative_topic_date_separators_body(inputs)
});