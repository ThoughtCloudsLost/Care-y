/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Panel_BodyInputs */

const en_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tapping the client alias or the case button in the navigation bar opens a panel holding the full case record and every case level action.
**Fields.** The panel shows the title, description, status, the role masked client phone number, and the opened date, along with the notes and media attached to the case.
**Actions.** From the panel a volunteer can call the client, assign the ticket, take it or release it, place it on hold, watch it to follow updates without being assigned, and close or reopen it.
**Phone number.** Tapping the phone row offers copy and edit. If an edited number matches an existing client, a merge sheet resolves the conflict.
**Encryption.** Every change made from the panel is encrypted in the browser before it is sent, the same as edits made anywhere else in the app.`)
};

const es_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tocar el alias del cliente o el boton de caso en la barra de navegacion abre un panel con el registro completo del caso y todas las acciones a nivel de caso.
**Campos.** El panel muestra el titulo, la descripcion, el estado, el numero de telefono del cliente enmascarado por rol y la fecha de apertura, junto con las notas y los archivos adjuntos al caso.
**Acciones.** Desde el panel un voluntario puede llamar al cliente, asignar el ticket, tomarlo o liberarlo, ponerlo en espera, observarlo para seguir actualizaciones sin estar asignado, y cerrarlo o reabrirlo.
**Numero de telefono.** Tocar la fila de telefono ofrece copiar y editar. Si un numero editado coincide con un cliente existente, una hoja de fusion resuelve el conflicto.
**Cifrado.** Cada cambio realizado desde el panel se cifra en el navegador antes de enviarse, igual que las ediciones hechas en cualquier otra parte de la aplicacion.`)
};

/**
* | output |
* | --- |
* | "Tapping the client alias or the case button in the navigation bar opens a panel holding the full case record and every case level action. **Fields.** The pan..." |
*
* @param {Demo_Narrative_Topic_Case_Panel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_panel_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Panel_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Panel_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_case_panel_body(inputs)
	return es_demo_narrative_topic_case_panel_body(inputs)
});