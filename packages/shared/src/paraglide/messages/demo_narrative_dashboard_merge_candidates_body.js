/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs */

const en_demo_narrative_dashboard_merge_candidates_body = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the system finds two client records that may belong to the same person, they appear here as merge candidates. Each pair shows two client aliases with a chip indicating the match type (shared phone number or shared email address). Up to five candidates appear at a time. When more exist, a notice prompts resolving or dismissing some to reveal the rest.
**Privacy.** The scan covers only clients whose tickets the current volunteer can decrypt. Different volunteers may see different candidates. The server proposes matches using blind index hashes stored alongside encrypted contact data. It cannot decrypt the identifiers themselves. The browser decrypts matched client aliases locally.
**Shared lines.** Phone match candidates include a shared line option for marking a number as a shared phone (such as a shelter or clinic line). Marking a number as shared removes it from future duplicate scans.`)
};

const es_demo_narrative_dashboard_merge_candidates_body = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando el sistema encuentra dos registros de clientes que podrían pertenecer a la misma persona, aparecen aquí como candidatos para fusión. Cada par muestra dos alias de cliente con una insignia indicando el tipo de coincidencia (número de teléfono compartido o dirección de correo electrónico compartida). Se muestran hasta cinco candidatos a la vez. Cuando existen más, un aviso solicita resolver o descartar algunos para revelar el resto.
**Privacidad.** El escaneo cubre solo clientes cuyos tickets el voluntario actual puede descifrar. Diferentes voluntarios pueden ver diferentes candidatos. El servidor propone coincidencias usando hashes de índice ciego almacenados junto con los datos de contacto cifrados. No puede descifrar los identificadores. El navegador descifra los alias de los clientes coincidentes localmente.
**Líneas compartidas.** Los candidatos que coinciden por teléfono incluyen una opción de línea compartida para marcar un número como teléfono compartido (como el de un refugio o clínica). Marcar un número como compartido lo excluye de futuros escaneos de duplicados.`)
};

/**
* | output |
* | --- |
* | "When the system finds two client records that may belong to the same person, they appear here as merge candidates. Each pair shows two client aliases with a ..." |
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