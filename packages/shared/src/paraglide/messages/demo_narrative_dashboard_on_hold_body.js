/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_On_Hold_BodyInputs */

const en_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets the current volunteer has placed on hold. These are still open but set aside, typically while waiting for a response from a client or an external party.
**Resuming.** Changing a ticket's status back to active from the ticket detail view returns it to the main working list.
**Visibility.** This section only appears when at least one ticket is on hold. Otherwise it is hidden.`)
};

const es_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets que el voluntario actual ha puesto en espera. Siguen abiertos pero apartados, normalmente a la espera de una respuesta de un cliente o una parte externa.
**Reanudar.** Cambiar el estado de un ticket a activo desde la vista detallada lo devuelve a la lista de trabajo principal.
**Visibilidad.** Esta sección solo aparece cuando al menos un ticket está en espera. De lo contrario, se oculta.`)
};

const en_xa2_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèts thè cùrrènt vòlùntèèr hàs plàcèd òn hòld. Thèsè àrè stìll òpèn bùt sèt àsìdè, typìcàlly whìlè wàìtìng fòr à rèspònsè fròm à clìènt òr àn èxtèrnàl pàrty.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Rèsùmìng. •••** Chàngìng à tìckèt's stàtùs bàck tò àctìvè fròm thè tìckèt dètàìl vìèw rètùrns ìt tò thè màìn wòrkìng lìst.
 •••••••••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thìs sèctìòn ònly àppèàrs whèn àt lèàst ònè tìckèt ìs òn hòld. Òthèrwìsè ìt ìs hìddèn. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tickets the current volunteer has placed on hold. These are still open but set aside, typically while waiting for a response from a client or an external par..." |
*
* @param {Demo_Narrative_Dashboard_On_Hold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_on_hold_body = /** @type {((inputs?: Demo_Narrative_Dashboard_On_Hold_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_On_Hold_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_on_hold_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_on_hold_body(inputs)
	return en_demo_narrative_dashboard_on_hold_body(inputs)
});