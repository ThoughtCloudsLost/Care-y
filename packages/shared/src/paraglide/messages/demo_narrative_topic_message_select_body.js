/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Message_Select_BodyInputs */

const en_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selection mode picks several messages from the thread and copies them as text to the device clipboard. The copied text is one line per message in thread order, not in the order the messages were selected. Each line carries a relative time, the author, and the decrypted text. The clipboard is outside the application, and no part of the ticket's encryption follows the text once it leaves. [[#client-data #privacy]]
**What does each line carry?** A client message carries the client's alias as its author. A volunteer message carries the volunteer's decrypted display name, with a fallback to a generic volunteer label when the name cannot be resolved. An internal note appends a note marker to the author. A system message carries a fixed system marker. The time on each line is relative. A pasted extract carries no date to anchor when each message was written. [[#client-data]]
**What happens when text is not decrypted?** A message whose text has not finished decrypting, a message the account cannot access, and a message whose decrypt failed each produce a distinct marker in place of the text. The copy uses text the browser has already decrypted rather than decrypting again. [[#failure-states #client-data]]
**What does the server learn?** Selecting and copying send no request. The server cannot learn which messages an account selected or that a copy happened. [[#server-holds #privacy]]
**The composable and its lifecycle.** \`create-select-mode.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` holds the selected message identifiers in a set. Entering the mode clears the set, and leaving clears it. A copy always closes the mode, and when the browser's clipboard API throws, a notification tells the account the copy failed before the mode closes. [[#client-data]]`)
};

const es_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El modo de selección toma varios mensajes del hilo y los copia como texto al portapapeles del dispositivo. El texto copiado es una línea por mensaje en el orden del hilo, no en el orden en que se seleccionaron. Cada línea lleva un tiempo relativo, la autoría y el texto descifrado. El portapapeles queda fuera de la aplicación, y ninguna parte del cifrado del ticket sigue al texto una vez que sale. [[#client-data #privacy]]
**¿Qué lleva cada línea?** Un mensaje del cliente lleva el alias del cliente como autoría. Un mensaje de una persona voluntaria lleva su nombre visible descifrado, con un respaldo a una etiqueta genérica de voluntario cuando el nombre no se puede resolver. Una nota interna añade un marcador de nota a la autoría. Un mensaje del sistema lleva un marcador de sistema fijo. El tiempo en cada línea es relativo. Un extracto pegado no lleva ninguna fecha que ancle cuándo se escribió cada mensaje. [[#client-data]]
**¿Qué ocurre cuando el texto no está descifrado?** Un mensaje cuyo texto no ha terminado de descifrarse, un mensaje al que la cuenta no tiene acceso y un mensaje cuyo descifrado falló producen cada uno un marcador distinto en lugar del texto. La copia usa texto que el navegador ya ha descifrado en lugar de descifrar de nuevo. [[#failure-states #client-data]]
**¿Qué aprende el servidor?** Seleccionar y copiar no envían ninguna petición. El servidor no puede saber qué mensajes seleccionó una cuenta ni que se realizó una copia. [[#server-holds #privacy]]
**El composable y su ciclo de vida.** \`create-select-mode.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, guarda los identificadores de los mensajes seleccionados en un conjunto. Entrar en el modo vacía el conjunto, y salir lo vacía también. Una copia siempre cierra el modo, y cuando la API de portapapeles del navegador falla, una notificación avisa a la cuenta de que la copia no se completó antes de que el modo se cierre. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèctìòn mòdè pìcks sèvèràl mèssàgès fròm thè thrèàd ànd còpìès thèm às tèxt tò thè dèvìcè clìpbòàrd. Thè còpìèd tèxt ìs ònè lìnè pèr mèssàgè ìn thrèàd òrdèr, nòt ìn thè òrdèr thè mèssàgès wèrè sèlèctèd. Èàch lìnè càrrìès à rèlàtìvè tìmè, thè àùthòr, ànd thè dècryptèd tèxt. Thè clìpbòàrd ìs òùtsìdè thè àpplìcàtìòn, ànd nò pàrt òf thè tìckèt's èncryptìòn fòllòws thè tèxt òncè ìt lèàvès. [[#clìènt-dàtà #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès èàch lìnè càrry? ••••••••** À clìènt mèssàgè càrrìès thè clìènt's àlìàs às ìts àùthòr. À vòlùntèèr mèssàgè càrrìès thè vòlùntèèr's dècryptèd dìsplày nàmè, wìth à fàllbàck tò à gènèrìc vòlùntèèr làbèl whèn thè nàmè cànnòt bè rèsòlvèd. Àn ìntèrnàl nòtè àppènds à nòtè màrkèr tò thè àùthòr. À systèm mèssàgè càrrìès à fìxèd systèm màrkèr. Thè tìmè òn èàch lìnè ìs rèlàtìvè. À pàstèd èxtràct càrrìès nò dàtè tò ànchòr whèn èàch mèssàgè wàs wrìttèn. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns whèn tèxt ìs nòt dècryptèd? ••••••••••••** À mèssàgè whòsè tèxt hàs nòt fìnìshèd dècryptìng, à mèssàgè thè àccòùnt cànnòt àccèss, ànd à mèssàgè whòsè dècrypt fàìlèd èàch pròdùcè à dìstìnct màrkèr ìn plàcè òf thè tèxt. Thè còpy ùsès tèxt thè bròwsèr hàs àlrèàdy dècryptèd ràthèr thàn dècryptìng àgàìn. [[#fàìlùrè-stàtès #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr lèàrn? •••••••••** Sèlèctìng ànd còpyìng sènd nò rèqùèst. Thè sèrvèr cànnòt lèàrn whìch mèssàgès àn àccòùnt sèlèctèd òr thàt à còpy hàppènèd. [[#sèrvèr-hòlds #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••**Thè còmpòsàblè ànd ìts lìfècyclè. ••••••••••** \`crèàtè-sèlèct-mòdè.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\` hòlds thè sèlèctèd mèssàgè ìdèntìfìèrs ìn à sèt. Èntèrìng thè mòdè clèàrs thè sèt, ànd lèàvìng clèàrs ìt. À còpy àlwàys clòsès thè mòdè, ànd whèn thè bròwsèr's clìpbòàrd ÀPÌ thròws, à nòtìfìcàtìòn tèlls thè àccòùnt thè còpy fàìlèd bèfòrè thè mòdè clòsès. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Selection mode picks several messages from the thread and copies them as text to the device clipboard. The copied text is one line per message in thread orde..." |
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