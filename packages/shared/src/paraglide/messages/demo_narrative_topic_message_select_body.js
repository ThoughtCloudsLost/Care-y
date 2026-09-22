/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Message_Select_BodyInputs */

const en_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selection mode takes several entries from the thread at once and copies them as text. [[#client-data]]
**What the copy contains.** One line per entry, each carrying the time, who wrote it and the decrypted text, with a client's entries attributed to their alias and internal notes marked as such. An entry the browser has not opened is copied as a marker naming why rather than as a guess, so an entry the account holds no key for reads as unavailable instead of blank. [[#failure-states #client-data]]
**Where the copy goes.** The device clipboard, which is outside what the application controls. Text that leaves the thread this way can be read by whatever else on that device reads the clipboard and pasted anywhere, and no part of the case's protection follows it. [[#privacy]]
**What the server learns.** Nothing. Selecting and copying send no request, so which entries anyone singled out on a case is not a fact the server holds. [[#server-holds #privacy]]
**The selection state.** \`create-select-mode.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` holds the selected identifiers in a set that lives for the length of the mode, reads its text from the decrypt cache rather than decrypting again, and clears itself after a copy. [[#client-data]]`)
};

const es_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El modo de selección toma varias entradas del hilo a la vez y las copia como texto. [[#client-data]]
**Lo que contiene la copia.** Una línea por entrada, con la hora, quién la escribió y el texto descifrado, atribuyendo las entradas de un cliente a su alias y marcando las notas internas como tales. Una entrada que el navegador no ha abierto se copia como un marcador que dice por qué y no como una suposición, de modo que una entrada para la que la cuenta no tiene clave se lee como no disponible en lugar de quedar vacía. [[#failure-states #client-data]]
**Adónde va la copia.** Al portapapeles del dispositivo, que queda fuera de lo que la aplicación controla. El texto que sale del hilo por esta vía lo puede leer cualquier otra cosa del dispositivo que lea el portapapeles y se puede pegar en cualquier sitio, y ninguna parte de la protección del caso lo acompaña. [[#privacy]]
**Lo que aprende el servidor.** Nada. Seleccionar y copiar no envían ninguna petición, así que qué entradas destacó alguien en un caso no es un dato que tenga el servidor. [[#server-holds #privacy]]
**El estado de la selección.** \`create-select-mode.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, guarda los identificadores seleccionados en un conjunto que vive lo que dura el modo, toma su texto de la caché de descifrado en lugar de descifrar otra vez, y se vacía tras una copia. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèctìòn mòdè àllòws pìckìng mèssàgès fròm thè thrèàd ìndìvìdùàlly òr àll àt òncè.
 ••••••••••••••••••••••••••**Còpy. ••** Thè sèlèctìòn bàr còpìès thè dècryptèd tèxt òf èvèry sèlèctèd mèssàgè tò thè clìpbòàrd ìn ònè àctìòn.
 •••••••••••••••••••••••••••••••**Prìvàcy. •••** Sèlèctìòn stàtè ànd thè còpìèd tèxt stày òn thè dèvìcè. Thè sèrvèr dòès nòt knòw whìch mèssàgès wèrè sèlèctèd. ••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Selection mode takes several entries from the thread at once and copies them as text. [[#client-data]] **What the copy contains.** One line per entry, each c..." |
*
* @param {Demo_Narrative_Topic_Message_Select_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_select_body = /** @type {((inputs?: Demo_Narrative_Topic_Message_Select_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Message_Select_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_message_select_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_message_select_body(inputs)
	return en_demo_narrative_topic_message_select_body(inputs)
});