/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Date_Separators_BodyInputs */

const en_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A date separator marks each change of day in the thread, and a separate line marks where reading stopped last time. The same component draws both lines on the ticket thread and on the client's portal thread; a client and an account reading one conversation see the days split in the same places. [[#client-data]]
**How does the browser decide the day boundary?** Two follow-ups fall on different days when their calendar dates differ in the device's own time zone. The browser computes this from the timestamps it already holds, with no server input. An account reading on a device set to another zone sees the boundaries that device implies. [[#failure-states #privacy]]
**Where does the unread line come from?** The line is read from an encrypted marker per account per ticket, sealed with the ticket key. The marker records the point reading last reached. The row tells the server that an account opened the ticket, which is why the ticket list never creates one. [Unread badges](#tickets/unread-badges) covers the row's encryption, its indistinguishability from a first-open decoy, and the sweep that turns cursors into counts. [[#encryption #server-holds #metadata]]
**Debounce and deletion.** Reading progress is held for a few seconds and written once rather than on every follow-up that passes. Closing a ticket deletes every account's marker for it; reopening does not restore them, so a closed ticket carries no record of who read how far. [Closing and reopening](#ticket-detail/close-reopen) covers what else a close removes. [[#retention #privacy]]
**The separator and cursor services.** \`formatDateSeparator\` and \`needsDateSeparator\` in \`packages/client/src/lib/utils/time.ts\` decide and label the breaks; \`DateSeparator.svelte\` draws them for both threads. The cursor is handled by \`create-read-cursor.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` against \`packages/server/src/tickets/read-cursor-service.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un separador de fecha marca cada cambio de día en el hilo, y una línea aparte marca dónde se dejó de leer la última vez. El mismo componente dibuja ambas líneas en el hilo de caso unificado y en el hilo del portal del cliente; el cliente y una cuenta que leen la misma conversación ven los días divididos en los mismos lugares. [[#client-data]]
**¿Cómo decide el navegador el límite de día?** Dos seguimientos caen en días diferentes cuando sus fechas de calendario difieren en la zona horaria del propio dispositivo. El navegador lo calcula a partir de las marcas de tiempo que ya tiene, sin intervención del servidor. Una cuenta que lee desde un dispositivo en otra zona horaria ve los límites que ese dispositivo implica. [[#failure-states #privacy]]
**¿De dónde sale la línea de no leídos?** La línea se lee de un marcador cifrado por cuenta y por ticket, sellado con la clave del ticket. El marcador registra el punto hasta donde se leyó. La fila le indica al servidor que una cuenta abrió el ticket, por eso la lista de tickets nunca crea una. [Insignias de no leídos](#tickets/unread-badges) trata el cifrado de la fila, su indistinguibilidad de un señuelo de primera apertura y el barrido que convierte los cursores en conteos. [[#encryption #server-holds #metadata]]
**Antirrebote y eliminación.** El progreso de lectura se retiene unos segundos y se escribe una sola vez en lugar de con cada seguimiento que pasa. Cerrar un ticket elimina el marcador de cada cuenta; reabrirlo no los restaura, de modo que un ticket cerrado no conserva registro de quién leyó hasta dónde. [Cerrar y reabrir](#ticket-detail/close-reopen) trata lo que un cierre elimina además de esto. [[#retention #privacy]]
**Los servicios de separador y cursor.** \`formatDateSeparator\` y \`needsDateSeparator\` en \`packages/client/src/lib/utils/time.ts\` deciden y etiquetan los cortes; \`DateSeparator.svelte\` los dibuja en ambos hilos. El cursor lo gestiona \`create-read-cursor.svelte.ts\` en \`packages/client/src/lib/composables/ticket-detail/\` contra \`packages/server/src/tickets/read-cursor-service.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À dàtè sèpàràtòr màrks èàch chàngè òf dày ìn thè thrèàd, ànd à sèpàràtè lìnè màrks whèrè rèàdìng stòppèd làst tìmè. Thè sàmè còmpònènt dràws bòth lìnès òn thè tìckèt thrèàd ànd òn thè clìènt's pòrtàl thrèàd; à clìènt ànd àn àccòùnt rèàdìng ònè cònvèrsàtìòn sèè thè dàys splìt ìn thè sàmè plàcès. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw dòès thè bròwsèr dècìdè thè dày bòùndàry? ••••••••••••••** Twò fòllòw-ùps fàll òn dìffèrènt dàys whèn thèìr càlèndàr dàtès dìffèr ìn thè dèvìcè's òwn tìmè zònè. Thè bròwsèr còmpùtès thìs fròm thè tìmèstàmps ìt àlrèàdy hòlds, wìth nò sèrvèr ìnpùt. Àn àccòùnt rèàdìng òn à dèvìcè sèt tò ànòthèr zònè sèès thè bòùndàrìès thàt dèvìcè ìmplìès. [[#fàìlùrè-stàtès #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè dòès thè ùnrèàd lìnè còmè fròm? ••••••••••••** Thè lìnè ìs rèàd fròm àn èncryptèd màrkèr pèr àccòùnt pèr tìckèt, sèàlèd wìth thè tìckèt kèy. Thè màrkèr rècòrds thè pòìnt rèàdìng làst rèàchèd. Thè ròw tèlls thè sèrvèr thàt àn àccòùnt òpènèd thè tìckèt, whìch ìs why thè tìckèt lìst nèvèr crèàtès ònè. [Ùnrèàd bàdgès](#tìckèts/ùnrèàd-bàdgès) còvèrs thè ròw's èncryptìòn, ìts ìndìstìngùìshàbìlìty fròm à fìrst-òpèn dècòy, ànd thè swèèp thàt tùrns cùrsòrs ìntò còùnts. [[#èncryptìòn #sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèbòùncè ànd dèlètìòn. •••••••** Rèàdìng prògrèss ìs hèld fòr à fèw sècònds ànd wrìttèn òncè ràthèr thàn òn èvèry fòllòw-ùp thàt pàssès. Clòsìng à tìckèt dèlètès èvèry àccòùnt's màrkèr fòr ìt; rèòpènìng dòès nòt rèstòrè thèm, sò à clòsèd tìckèt càrrìès nò rècòrd òf whò rèàd hòw fàr. [Clòsìng ànd rèòpènìng](#tìckèt-dètàìl/clòsè-rèòpèn) còvèrs whàt èlsè à clòsè rèmòvès. [[#rètèntìòn #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè sèpàràtòr ànd cùrsòr sèrvìcès. •••••••••••** \`fòrmàtDàtèSèpàràtòr\` ànd \`nèèdsDàtèSèpàràtòr\` ìn \`pàckàgès/clìènt/src/lìb/ùtìls/tìmè.ts\` dècìdè ànd làbèl thè brèàks; \`DàtèSèpàràtòr.svèltè\` dràws thèm fòr bòth thrèàds. Thè cùrsòr ìs hàndlèd by \`crèàtè-rèàd-cùrsòr.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\` àgàìnst \`pàckàgès/sèrvèr/src/tìckèts/rèàd-cùrsòr-sèrvìcè.ts\`. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A date separator marks each change of day in the thread, and a separate line marks where reading stopped last time. The same component draws both lines on th..." |
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