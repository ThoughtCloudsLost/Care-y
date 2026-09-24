/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roster_Tools_BodyInputs */

const en_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The users tab has the same working tools as the ticket list.
**Filters.** The roster's filter pills narrow results by role, status, key state, and queue membership.
**Sort.** The roster sorts by name, role, or status.
**Search.** The roster search matches against decrypted display names in the browser, and search terms never leave the device.
**Bulk actions.** The roster's select mode lets the user pick multiple accounts and deactivate them in one action, behind a confirmation, and deactivation is reversible.`)
};

const es_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pestaña de usuarios tiene las mismas herramientas de trabajo que la lista de tickets.
**Filtros.** Las pastillas del directorio acotan resultados por rol, estado, estado de clave y pertenencia a colas.
**Ordenar.** El directorio se ordena por nombre, rol o estado.
**Buscar.** La búsqueda del directorio compara contra los nombres visibles descifrados en el navegador, y los términos de búsqueda nunca salen del dispositivo.
**Acciones masivas.** El modo de selección del directorio permite elegir varias cuentas y desactivarlas en una sola acción, con confirmación previa, y la desactivación es reversible.`)
};

const en_xa2_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ùsèrs tàb hàs thè sàmè wòrkìng tòòls às thè tìckèt lìst.
 •••••••••••••••••••**Fìltèrs. •••** Thè ròstèr's fìltèr pìlls nàrròw rèsùlts by ròlè, stàtùs, kèy stàtè, ànd qùèùè mèmbèrshìp.
 ••••••••••••••••••••••••••••**Sòrt. ••** Thè ròstèr sòrts by nàmè, ròlè, òr stàtùs.
 ••••••••••••••**Sèàrch. •••** Thè ròstèr sèàrch màtchès àgàìnst dècryptèd dìsplày nàmès ìn thè bròwsèr, ànd sèàrch tèrms nèvèr lèàvè thè dèvìcè.
 •••••••••••••••••••••••••••••••••••**Bùlk àctìòns. ••••** Thè ròstèr's sèlèct mòdè lèts thè ùsèr pìck mùltìplè àccòùnts ànd dèàctìvàtè thèm ìn ònè àctìòn, bèhìnd à cònfìrmàtìòn, ànd dèàctìvàtìòn ìs rèvèrsìblè. ••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The users tab has the same working tools as the ticket list. **Filters.** The roster's filter pills narrow results by role, status, key state, and queue memb..." |
*
* @param {Demo_Narrative_Admin_Roster_Tools_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roster_tools_body = /** @type {((inputs?: Demo_Narrative_Admin_Roster_Tools_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Roster_Tools_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_roster_tools_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_roster_tools_body(inputs)
	return en_demo_narrative_admin_roster_tools_body(inputs)
});