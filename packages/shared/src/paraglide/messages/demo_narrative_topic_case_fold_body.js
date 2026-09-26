/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Fold_BodyInputs */

const en_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Folding a ticket hides the description, the queue, who holds the ticket, and how long ago it was opened. The title, the priority, and whether the ticket is closed stay. On a wide window the fold control does not exist. [[#client-data #ticket-detail]]
**Where does the fold live?** One entry in a reactive map held in the tab's memory, keyed by ticket identifier. The fold choice stays in memory only and leaves no trace on the device or the network. The server cannot learn which tickets the user folds or how long any ticket stays open, and a later reader of the device cannot either. A reload creates the map fresh, so every ticket opens with its fields showing. Folding one ticket leaves the others unchanged for the rest of the session. [[#privacy #server-holds]]
**The fold store and drag handling.** \`packages/client/src/lib/tickets/case-fold-store.svelte.ts\` holds the map; unfolding deletes the entry rather than storing false. Drag and keyboard handling is in \`packages/client/src/lib/shell/use-fold-drag.svelte.ts\`. [The case header](#ticket-detail/case-header) covers the fields themselves. [[#client-data]]`)
};

const es_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plegar un ticket oculta la descripción, la cola, quién lleva el ticket y cuánto hace que se abrió. El título, la prioridad y si el ticket está cerrado permanecen. En una ventana ancha el control de plegado no existe. [[#client-data #ticket-detail]]
**¿Dónde vive el plegado?** Una entrada en un mapa reactivo que vive en la memoria de la pestaña, indexada por identificador de ticket. La elección de plegado permanece solo en memoria y no deja rastro en el dispositivo ni en la red. El servidor no puede saber qué tickets pliega la persona usuaria ni cuánto tiempo permanece abierto un ticket, y quien lea el dispositivo después tampoco puede saberlo. Una recarga crea el mapa de nuevo, así que cada ticket se abre con sus campos a la vista. Plegar un ticket deja los demás sin cambios durante el resto de la sesión. [[#privacy #server-holds]]
**El almacén del plegado y el manejo del arrastre.** \`packages/client/src/lib/tickets/case-fold-store.svelte.ts\` contiene el mapa; desplegar borra la entrada en lugar de guardar un valor falso. El arrastre y el manejo de teclado están en \`packages/client/src/lib/shell/use-fold-drag.svelte.ts\`. [El encabezado del caso](#ticket-detail/case-header) trata los campos en sí. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòldìng à tìckèt hìdès thè dèscrìptìòn, thè qùèùè, whò hòlds thè tìckèt, ànd hòw lòng àgò ìt wàs òpènèd. Thè tìtlè, thè prìòrìty, ànd whèthèr thè tìckèt ìs clòsèd stày. Òn à wìdè wìndòw thè fòld còntròl dòès nòt èxìst. [[#clìènt-dàtà #tìckèt-dètàìl]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè dòès thè fòld lìvè? ••••••••** Ònè èntry ìn à rèàctìvè màp hèld ìn thè tàb's mèmòry, kèyèd by tìckèt ìdèntìfìèr. Thè fòld chòìcè stàys ìn mèmòry ònly ànd lèàvès nò tràcè òn thè dèvìcè òr thè nètwòrk. Thè sèrvèr cànnòt lèàrn whìch tìckèts thè ùsèr fòlds òr hòw lòng àny tìckèt stàys òpèn, ànd à làtèr rèàdèr òf thè dèvìcè cànnòt èìthèr. À rèlòàd crèàtès thè màp frèsh, sò èvèry tìckèt òpèns wìth ìts fìèlds shòwìng. Fòldìng ònè tìckèt lèàvès thè òthèrs ùnchàngèd fòr thè rèst òf thè sèssìòn. [[#prìvàcy #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fòld stòrè ànd dràg hàndlìng. ••••••••••** \`pàckàgès/clìènt/src/lìb/tìckèts/càsè-fòld-stòrè.svèltè.ts\` hòlds thè màp; ùnfòldìng dèlètès thè èntry ràthèr thàn stòrìng fàlsè. Dràg ànd kèybòàrd hàndlìng ìs ìn \`pàckàgès/clìènt/src/lìb/shèll/ùsè-fòld-dràg.svèltè.ts\`. [Thè càsè hèàdèr](#tìckèt-dètàìl/càsè-hèàdèr) còvèrs thè fìèlds thèmsèlvès. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Folding a ticket hides the description, the queue, who holds the ticket, and how long ago it was opened. The title, the priority, and whether the ticket is c..." |
*
* @param {Demo_Narrative_Topic_Case_Fold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_fold_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Fold_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Fold_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_case_fold_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_case_fold_body(inputs)
	return en_demo_narrative_topic_case_fold_body(inputs)
});