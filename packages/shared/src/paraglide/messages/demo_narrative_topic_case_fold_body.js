/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Fold_BodyInputs */

const en_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Folding the case record away leaves the title, the priority and the closed state and hides the description, the queue, the assignment and the opened time until the record is unfolded again. [[#client-data]]
**What folding records.** One entry in a map held in the tab's memory, keyed by case id. Nothing is written to browser storage and no request is sent, so how long anyone keeps a case record open, and which cases they fold, is not a fact the server or a later reader of the device has. [[#privacy #server-holds]]
**What a reload does.** The map is created fresh with each load of the application, so every case opens with its record showing. The fold is per case, so folding one case leaves the others as they were for the rest of the session. [[#failure-states]]
**The fold store.** \`packages/client/src/lib/tickets/case-fold-store.svelte.ts\` is a reactive map with a getter and a setter, and unfolding deletes the key rather than storing false. The drag and keyboard handling is \`use-fold-drag.svelte.ts\` in \`packages/client/src/lib/shell/\`. [The case record](#ticket-detail/case-header) covers the fields themselves. [[#client-data]]`)
};

const es_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plegar el registro del caso deja el título, la prioridad y el estado de cerrado y oculta la descripción, la cola, la asignación y la fecha de apertura hasta que se despliega de nuevo. [[#client-data]]
**Lo que registra el plegado.** Una entrada en un mapa que vive en la memoria de la pestaña, indexada por identificador de caso. No se escribe nada en el almacenamiento del navegador ni se envía ninguna petición, así que cuánto tiempo mantiene alguien abierto un registro, y qué casos pliega, no es un dato que tenga el servidor ni quien lea después el dispositivo. [[#privacy #server-holds]]
**Lo que hace una recarga.** El mapa se crea de nuevo con cada carga de la aplicación, de modo que todos los casos se abren con su registro a la vista. El plegado es por caso, así que plegar uno deja los demás como estaban durante el resto de la sesión. [[#failure-states]]
**El almacén del plegado.** \`packages/client/src/lib/tickets/case-fold-store.svelte.ts\` es un mapa reactivo con un getter y un setter, y desplegar borra la clave en lugar de guardar un valor falso. El arrastre y el manejo de teclado están en \`use-fold-drag.svelte.ts\`, en \`packages/client/src/lib/shell/\`. [El registro del caso](#ticket-detail/case-header) trata los campos en sí. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè càsè fìèlds bèlòw thè hèàdèr càn bè fòldèd àwày. Thè tìtlè, stàtùs, ànd prìòrìty stày vìsìblè ìn thè hèàdèr àbòvè.
 ••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè dèscrìptìòn ìs èncryptèd wìth thè pèr tìckèt kèy, ànd thè qùèùè ànd àssìgnèè nàmès wìth thè òrgànìzàtìòn kèy. Thè òpènèd dàtè ìs plàìntèxt mètàdàtà thè sèrvèr ùsès fòr sòrtìng.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fùll rècòrd. •••••** Thè còmplètè fìèld lìst, àlòng wìth thè ròlè màskèd clìènt phònè nùmbèr ànd thè càsè àctìòns, lìvès ìn thè càsè pànèl. ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Folding the case record away leaves the title, the priority and the closed state and hides the description, the queue, the assignment and the opened time unt..." |
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