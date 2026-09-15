/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs */

const en_demo_narrative_dashboard_merge_candidates_body = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the system finds two client records that may refer to the same person, it surfaces them in a merge candidates section on the dashboard. Each candidate pair shows two client aliases with a chip indicating the match type, either a shared phone number or a shared email address.
**Review.** Tapping a pair opens a side by side comparison of both client records so a volunteer can verify whether they are genuinely the same person.
**Dismiss.** If the match is coincidental and the two records are distinct people, the dismiss button removes the pair from the list without merging anything.
**Bounded list.** The section shows up to five candidates at a time, and a notice above the list explains that the scan covers only clients whose tickets the current volunteer can decrypt, so other volunteers may see different results. When there are more duplicates than the visible cap, a second notice reads "There are more possible duplicates than shown. Resolve or dismiss some, or mark shared numbers, to see the rest."
**Shared line.** Phone match candidates show a Shared line button that marks the matching number as a shared line, such as a shelter or clinic phone that many people use. The phone edit sheet also has a Shared line toggle, and its hint reads "Many people use this number, like a shelter or clinic phone. Shared numbers are not used to suggest duplicates." Marking a number as shared removes it from future duplicate scans so the same number stops surfacing candidates.
**How matches are found.** Phone and email matches use blind index hashes that the server stores alongside the encrypted contact data, so the server proposes candidate pairs without decrypting any identifiers. What a volunteer can see of a match depends on which clients they can decrypt, and the browser decrypts the matched client aliases locally before showing the comparison.`)
};

const es_demo_narrative_dashboard_merge_candidates_body = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando el sistema encuentra dos registros de clientes que podrían referirse a la misma persona, los muestra en una sección de candidatos para fusión en el resumen. Cada par de candidatos muestra dos alias de cliente con una insignia indicando el tipo de coincidencia, ya sea un número de teléfono compartido o una dirección de correo electrónico compartida.
**Revisar.** Tocar un par abre una comparación lado a lado de ambos registros de cliente para que un voluntario pueda verificar si son genuinamente la misma persona.
**Descartar.** Si la coincidencia es casual y los dos registros son personas distintas, el botón de descartar elimina el par de la lista sin fusionar nada.
**Lista acotada.** La sección muestra hasta cinco candidatos a la vez, y un aviso sobre la lista explica que el escaneo cubre solo clientes cuyos tickets el voluntario actual puede descifrar, así que otros voluntarios podrían ver resultados diferentes. Cuando hay más duplicados de los que caben en el límite visible, un segundo aviso dice "Hay más posibles duplicados de los que se muestran. Resuelve o descarta algunos, o marca números compartidos, para ver el resto."
**Línea compartida.** Los candidatos que coinciden por teléfono muestran un botón de Línea compartida que marca el número como una línea compartida, como un teléfono de refugio o clínica que usan muchas personas. La hoja de edición de teléfono también tiene un interruptor de Línea compartida, y su indicación dice "Muchas personas usan este número, como un teléfono de refugio o clínica. Los números compartidos no se usan para sugerir duplicados." Marcar un número como compartido lo excluye de futuros escaneos de duplicados para que el mismo número deje de generar candidatos.
**Cómo se encuentran las coincidencias.** Las coincidencias de teléfono y correo electrónico usan hashes de índice ciego que el servidor almacena junto con los datos de contacto cifrados, de modo que el servidor propone pares candidatos sin descifrar ningún identificador. Lo que un voluntario puede ver de una coincidencia depende de qué clientes puede descifrar, y el navegador descifra los alias de los clientes coincidentes localmente antes de mostrar la comparación.`)
};

/**
* | output |
* | --- |
* | "When the system finds two client records that may refer to the same person, it surfaces them in a merge candidates section on the dashboard. Each candidate p..." |
*
* @param {Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_merge_candidates_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_merge_candidates_body(inputs)
	return en_demo_narrative_dashboard_merge_candidates_body(inputs)
});