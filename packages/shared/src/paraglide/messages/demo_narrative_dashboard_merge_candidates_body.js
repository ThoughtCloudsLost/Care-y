/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs */

const en_demo_narrative_dashboard_merge_candidates_body = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A scan pairs client records that share a phone number or an email address and offers each pair for review or dismissal. The matching runs in the browser; the server proposes nothing and is never given a contact value to compare. [[#client-data #privacy]]
**Where the matching happens.** The server returns encrypted intake responses, the map of which form field holds which kind of contact, and the match hashes the browser computed when each contact was first stored. The crypto worker opens the responses the account's key wraps allow, derives contact hashes from them, and compares hashes pairwise. What leaves the worker is a list of client id pairs and whether each match was a phone or an email. [[#encryption #server-holds]]
**What the scan can see.** Clients whose tickets the account can decrypt, plus clients carrying a stored match hash, and never a record already merged into another. Two accounts with different queue membership see different candidates, and the section says so rather than presenting its list as the whole picture. [[#permissions #privacy]]
**Shared numbers.** A number marked as a shared line, which is what a shelter or clinic switchboard is, stops producing candidates: the server leaves clients on that number out of the hash list and the worker suppresses the hash as well. The mark applies to every client record carrying that number, not to the one pair it was raised from. [[#client-data]]
**What a dismissal is.** One organization-key-sealed blob for the whole organization, read, extended and written back, so a pair dismissed by one account stays hidden for everyone and two dismissals written at once can lose one of them until the next write. The server stores and returns that blob without being able to read it. [[#encryption #server-holds]]
**Two separate limits.** The worker stops after two hundred pairs and reports that it stopped, which is what the notice about more duplicates than shown reflects. The section lists five pairs at a time regardless of that. [[#failure-states]]
**The scan path and its services.** \`createMergeScan\` in \`packages/client/src/lib/composables/create-merge-scan.svelte.ts\` waits for idle time after the ticket query settles, caches the result for the session and re-runs on a dismissal or a merge. The server side is \`packages/server/src/clients/merge-scan-service.ts\` for the scan inputs and \`dismissal-service.ts\` for the blob, and the comparison is the merge-candidate handler in \`packages/client/src/lib/workers/crypto-core.ts\`. [Merging clients](#admin-people/client-merge) covers what a merge does to the two records. [[#client-data]]`)
};

const es_demo_narrative_dashboard_merge_candidates_body = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un análisis empareja los registros de clientes que comparten un número de teléfono o una dirección de correo y presenta cada par para revisarlo o descartarlo. La comparación se ejecuta en el navegador; el servidor no propone nada y nunca recibe un valor de contacto que comparar. [[#client-data #privacy]]
**Dónde ocurre la comparación.** El servidor devuelve las respuestas de admisión cifradas, el mapa de qué campo de formulario contiene qué tipo de contacto y los hashes de coincidencia que el navegador calculó cuando cada contacto se guardó por primera vez. El worker criptográfico abre las respuestas que permiten los envoltorios de clave de la cuenta, deriva de ellas los hashes de contacto y los compara por pares. Lo que sale del worker es una lista de pares de identificadores de cliente y si cada coincidencia fue de teléfono o de correo. [[#encryption #server-holds]]
**Hasta dónde llega el análisis.** Los clientes cuyos tickets puede descifrar la cuenta, más los clientes con un hash de coincidencia guardado, y nunca un registro ya fusionado con otro. Dos cuentas con distinta pertenencia a colas ven candidatos distintos, y la sección lo indica en lugar de presentar su lista como el panorama completo. [[#permissions #privacy]]
**Números compartidos.** Un número marcado como línea compartida, que es lo que son las centralitas de un refugio o una clínica, deja de producir candidatos: el servidor excluye de la lista de hashes a los clientes con ese número y el worker suprime además ese hash. La marca se aplica a todos los registros de cliente que llevan ese número, no al par concreto desde el que se puso. [[#client-data]]
**Qué es un descarte.** Un único blob sellado con la clave de la organización para toda la organización, que se lee, se amplía y se vuelve a escribir, de modo que un par descartado por una cuenta queda oculto para todas y dos descartes escritos a la vez pueden perder uno de ellos hasta la siguiente escritura. El servidor guarda y devuelve ese blob sin poder leerlo. [[#encryption #server-holds]]
**Dos límites distintos.** El worker se detiene tras doscientos pares e informa de que se detuvo, que es lo que refleja el aviso de que hay más duplicados de los que se muestran. La sección enumera cinco pares cada vez al margen de eso. [[#failure-states]]
**La ruta del análisis y sus servicios.** \`createMergeScan\`, en \`packages/client/src/lib/composables/create-merge-scan.svelte.ts\`, espera a un momento de inactividad tras asentarse la consulta de tickets, guarda el resultado durante la sesión y vuelve a ejecutarse ante un descarte o una fusión. El lado del servidor es \`packages/server/src/clients/merge-scan-service.ts\` para las entradas del análisis y \`dismissal-service.ts\` para el blob, y la comparación es el manejador de candidatos de fusión de \`packages/client/src/lib/workers/crypto-core.ts\`. [Fusionar clientes](#admin-people/client-merge) trata lo que una fusión hace con los dos registros. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_merge_candidates_body = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn thè systèm fìnds twò clìènt rècòrds thàt mày bèlòng tò thè sàmè pèrsòn, thèy àppèàr hèrè às mèrgè càndìdàtès. Èàch pàìr shòws twò clìènt àlìàsès wìth à chìp ìndìcàtìng thè màtch typè (shàrèd phònè nùmbèr òr shàrèd èmàìl àddrèss). Ùp tò fìvè càndìdàtès àppèàr àt à tìmè. Whèn mòrè èxìst, à nòtìcè pròmpts rèsòlvìng òr dìsmìssìng sòmè tò rèvèàl thè rèst.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Prìvàcy. •••** Thè scàn còvèrs ònly clìènts whòsè tìckèts thè cùrrènt vòlùntèèr càn dècrypt. Dìffèrènt vòlùntèèrs mày sèè dìffèrènt càndìdàtès. Thè sèrvèr pròpòsès màtchès ùsìng blìnd ìndèx hàshès stòrèd àlòngsìdè èncryptèd còntàct dàtà. Ìt cànnòt dècrypt thè ìdèntìfìèrs thèmsèlvès. Thè bròwsèr dècrypts màtchèd clìènt àlìàsès lòcàlly.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Shàrèd lìnès. ••••** Phònè màtch càndìdàtès ìnclùdè à shàrèd lìnè òptìòn fòr màrkìng à nùmbèr às à shàrèd phònè (sùch às à shèltèr òr clìnìc lìnè). Màrkìng à nùmbèr às shàrèd rèmòvès ìt fròm fùtùrè dùplìcàtè scàns. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A scan pairs client records that share a phone number or an email address and offers each pair for review or dismissal. The matching runs in the browser; the..." |
*
* @param {Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_merge_candidates_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_merge_candidates_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_merge_candidates_body(inputs)
	return en_demo_narrative_dashboard_merge_candidates_body(inputs)
});