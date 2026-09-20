/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Responses_BodyInputs */

const en_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Submitted intake forms appear as cards in the response viewer. A field whose definition has since been removed from the form shows a marker and its raw key rather than disappearing, so no submission data is silently lost.
**Encryption.** Response fields are encrypted at submission time and decrypted in the browser. When the browser decrypts a response and finds that other users have no wrapped copy of the key, it mints wraps for them in the background without blocking the viewer.
**Permissions.** Viewing intake responses requires the View intake responses permission, which is an administrator default and carries a trust note because it grants decryption across queues.`)
};

const es_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los formularios de admisión enviados aparecen como tarjetas en el visor de respuestas. Un campo cuya definición se ha eliminado del formulario muestra un marcador y su clave original en lugar de desaparecer, de modo que ningún dato de envío se pierde silenciosamente.
**Cifrado.** Los campos de respuesta se cifran en el momento del envío y se descifran en el navegador. Cuando el navegador descifra una respuesta y encuentra que otras personas no tienen copia envuelta de la clave, genera envoltorios para ellas en segundo plano sin bloquear el visor.
**Permisos.** Ver las respuestas de admisión requiere el permiso Leer respuestas de ingreso de todas las colas, que es un valor predeterminado de administrador y lleva una nota de confianza porque otorga descifrado en todas las colas.`)
};

const en_xa2_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùbmìttèd ìntàkè fòrms àppèàr às càrds ìn thè rèspònsè vìèwèr. À fìèld whòsè dèfìnìtìòn hàs sìncè bèèn rèmòvèd fròm thè fòrm shòws à màrkèr ànd ìts ràw kèy ràthèr thàn dìsàppèàrìng, sò nò sùbmìssìòn dàtà ìs sìlèntly lòst.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Rèspònsè fìèlds àrè èncryptèd àt sùbmìssìòn tìmè ànd dècryptèd ìn thè bròwsèr. Whèn thè bròwsèr dècrypts à rèspònsè ànd fìnds thàt òthèr ùsèrs hàvè nò wràppèd còpy òf thè kèy, ìt mìnts wràps fòr thèm ìn thè bàckgròùnd wìthòùt blòckìng thè vìèwèr.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Vìèwìng ìntàkè rèspònsès rèqùìrès thè Vìèw ìntàkè rèspònsès pèrmìssìòn, whìch ìs àn àdmìnìstràtòr dèfàùlt ànd càrrìès à trùst nòtè bècàùsè ìt grànts dècryptìòn àcròss qùèùès. •••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Submitted intake forms appear as cards in the response viewer. A field whose definition has since been removed from the form shows a marker and its raw key r..." |
*
* @param {Demo_Narrative_Admin_Form_Responses_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_responses_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Responses_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Responses_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_responses_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_form_responses_body(inputs)
	return en_demo_narrative_admin_form_responses_body(inputs)
});