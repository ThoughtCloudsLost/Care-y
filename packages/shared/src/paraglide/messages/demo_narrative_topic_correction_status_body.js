/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Correction_Status_BodyInputs */

const en_demo_narrative_topic_correction_status_body = /** @type {(inputs: Demo_Narrative_Topic_Correction_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A contact correction reaches the case thread as its own kind of entry, carrying the phone number or the email address a client says is theirs now. [[#client-data]]
**What the entry carries.** A small versioned record holding a phone, an address, or both, sealed with the case key like any other entry, so the corrected value is readable in the browsers the case key is wrapped for and in no other place. The kind of entry and the fact that a client wrote it are plaintext columns, so a database dump shows that a client corrected their contact details on a case at a given minute, and neither the old value nor the new one. [The trust boundary](#deep-dive/the-trust-boundary) lists the columns a dump reaches. [[#encryption #server-holds #metadata]]
**Putting a correction into the client record.** The entry offers to carry each value into the matching contact row, which opens the edit path with the value already filled in and leaves the saving to the user, because a correction arrives over the same channel anyone could reach the organization on. A save that lands marks the correction handled. [The case panel](#ticket-detail/case-panel) covers what happens when the saved value already belongs to another client record. [[#client-data #privacy]]
**Marking one handled.** Handling is an acknowledge reaction on the entry, one row per account, and the line names the first account that left one. The row holds the entry, the account and the time in plaintext, so who reviewed a correction and when is visible to the server while the value they reviewed is not. [[#metadata #server-holds]]
**What an unhandled correction changes.** With a correction on the case that nobody has acknowledged, composing a text and opening the call options both report it, because both are about to use a number the client may have just replaced. The check runs in the browser over the loaded entries and their reactions, so a correction older than the loaded part of a long thread does not raise it. [[#failure-states #telephony]]
**The payload and its renderer.** \`packages/shared/src/schemas/contact-correction-payload.ts\` defines the record and parses it, and \`CorrectionBody.svelte\` renders it on the case thread and on the client's own thread from one implementation. Content that does not parse as a correction record is shown as ordinary text, which is what corrections written before the record existed decrypt to. [[#client-data #failure-states]]`)
};

const es_demo_narrative_topic_correction_status_body = /** @type {(inputs: Demo_Narrative_Topic_Correction_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una corrección de contacto llega al hilo del caso como un tipo de entrada propio, con el número de teléfono o la dirección de correo que un cliente dice tener ahora. [[#client-data]]
**Lo que lleva la entrada.** Un registro pequeño con versión que contiene un teléfono, una dirección o ambos, sellado con la clave del caso como cualquier otra entrada, de modo que el valor corregido se lee en los navegadores para los que está envuelta esa clave y en ningún otro sitio. El tipo de entrada y el hecho de que la escribió un cliente son columnas en texto plano, así que un volcado de la base de datos muestra que un cliente corrigió sus datos de contacto en un caso a una hora dada, y ni el valor antiguo ni el nuevo. [La frontera de confianza](#deep-dive/the-trust-boundary) enumera las columnas que alcanza un volcado. [[#encryption #server-holds #metadata]]
**Llevar una corrección al registro del cliente.** La entrada ofrece pasar cada valor a la fila de contacto correspondiente, lo que abre el camino de edición con el valor ya escrito y deja el guardado en manos de la persona usuaria, porque una corrección llega por el mismo canal por el que cualquiera podría dirigirse a la organización. Un guardado que se completa marca la corrección como atendida. [El panel del caso](#ticket-detail/case-panel) trata lo que ocurre cuando el valor guardado ya es de otro registro de cliente. [[#client-data #privacy]]
**Marcar una como atendida.** Atender es una reacción de confirmación sobre la entrada, una fila por cuenta, y la línea nombra a la primera cuenta que dejó una. La fila guarda la entrada, la cuenta y la fecha en texto plano, así que quién revisó una corrección y cuándo lo hizo es visible para el servidor, y el valor que revisó no. [[#metadata #server-holds]]
**Lo que cambia una corrección sin atender.** Si hay en el caso una corrección que nadie ha confirmado, redactar un mensaje de texto y abrir las opciones de llamada lo indican, porque ambas cosas van a usar un número que el cliente quizá acaba de reemplazar. La comprobación ocurre en el navegador sobre las entradas cargadas y sus reacciones, así que una corrección más antigua que la parte cargada de un hilo largo no la levanta. [[#failure-states #telephony]]
**El contenido y su presentación.** \`packages/shared/src/schemas/contact-correction-payload.ts\` define el registro y lo interpreta, y \`CorrectionBody.svelte\` lo presenta en el hilo del caso y en el hilo propio del cliente desde una sola implementación. El contenido que no se interpreta como registro de corrección se muestra como texto corriente, que es lo que descifran las correcciones escritas antes de que el registro existiera. [[#client-data #failure-states]]`)
};

const en_xa2_demo_narrative_topic_correction_status_body = /** @type {(inputs: Demo_Narrative_Topic_Correction_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn à clìènt ùpdàtès thèìr còntàct ìnfòrmàtìòn thròùgh thè pòrtàl, thè chàngè àppèàrs ìn thè tìckèt thrèàd às à flàggèd èntry wìth à tìntèd bàckgròùnd ànd àn ìcòn sò ìt stànds òùt fròm règùlàr mèssàgès. Thè èntry shòws strùctùrèd ròws fòr èàch chàngèd fìèld, wìth làbèls ànd nèw vàlùès.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àpply. ••** Whèn thè còrrèctìòn ìnclùdès à phònè nùmbèr òr èmàìl àddrèss, àn Àpply bùttòn nèxt tò thàt fìèld òpèns thè còrrèspòndìng èdìt flòw prèfìllèd wìth thè nèw vàlùè sò à vòlùntèèr càn ùpdàtè thè clìènt rècòrd ìn ònè tàp ràthèr thàn rètypìng ìt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àcknòwlèdgè. ••••** À tògglè bùttòn òn thè stàtùs lìnè lèts à vòlùntèèr màrk thè còrrèctìòn às hàndlèd. Àftèr tògglìng, thè lìnè shòws thè nàmè òf thè vòlùntèèr whò àcknòwlèdgèd ìt sò thè tèàm knòws whò rèvìèwèd thè chàngè.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why ìt àppèàrs ìn thè thrèàd. •••••••••** Còntàct còrrèctìòns àrè fòllòw-ùp èvènts stòrèd òn thè tìckèt, thè sàmè wày càlls ànd shàrès àrè, ànd plàcìng thèm ìn thè tìmèlìnè lèts thè tèàm sèè whèn thè chàngè hàppènèd rèlàtìvè tò thè cònvèrsàtìòn. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A contact correction reaches the case thread as its own kind of entry, carrying the phone number or the email address a client says is theirs now. [[#client-..." |
*
* @param {Demo_Narrative_Topic_Correction_Status_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_correction_status_body = /** @type {((inputs?: Demo_Narrative_Topic_Correction_Status_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Correction_Status_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_correction_status_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_correction_status_body(inputs)
	return en_demo_narrative_topic_correction_status_body(inputs)
});