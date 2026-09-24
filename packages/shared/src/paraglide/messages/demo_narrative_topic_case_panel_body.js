/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Panel_BodyInputs */

const en_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case panel holds the full case record and every case level action. It opens from the client alias or the case button in the navigation bar.
**Phone number.** If an edited number matches an existing client, a merge sheet opens to resolve the conflict.
**Encryption.** Every change made from the panel is encrypted in the browser before it is sent, the same as edits made anywhere else in the app.`)
};

const es_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel del caso contiene el registro completo del caso y todas las acciones a nivel de caso. Se abre desde el alias del cliente o el botón de caso en la barra de navegación.
**Número de teléfono.** Si un número editado coincide con un cliente existente, se abre una hoja de fusión para resolver el conflicto.
**Cifrado.** Cada cambio realizado desde el panel se cifra en el navegador antes de enviarse, igual que las ediciones hechas en cualquier otra parte de la aplicación.`)
};

const en_xa2_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè càsè pànèl hòlds thè fùll càsè rècòrd ànd èvèry càsè lèvèl àctìòn. Ìt òpèns fròm thè clìènt àlìàs òr thè càsè bùttòn ìn thè nàvìgàtìòn bàr.
 ••••••••••••••••••••••••••••••••••••••••••••**Phònè nùmbèr. ••••** Ìf àn èdìtèd nùmbèr màtchès àn èxìstìng clìènt, à mèrgè shèèt òpèns tò rèsòlvè thè cònflìct.
 •••••••••••••••••••••••••••••**Èncryptìòn. ••••** Èvèry chàngè màdè fròm thè pànèl ìs èncryptèd ìn thè bròwsèr bèfòrè ìt ìs sènt, thè sàmè às èdìts màdè ànywhèrè èlsè ìn thè àpp. •••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The case panel holds the full case record and every case level action. It opens from the client alias or the case button in the navigation bar. **Phone numbe..." |
*
* @param {Demo_Narrative_Topic_Case_Panel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_panel_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Panel_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Panel_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_case_panel_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_case_panel_body(inputs)
	return en_demo_narrative_topic_case_panel_body(inputs)
});