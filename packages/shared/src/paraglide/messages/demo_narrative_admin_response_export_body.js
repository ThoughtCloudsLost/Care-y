/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Response_Export_BodyInputs */

const en_demo_narrative_admin_response_export_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Export_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The export button at the top of the response viewer opens a dialog for downloading the responses as a CSV file.
**What is included.** The CSV contains every response the volunteer's browser was able to decrypt. Responses with a key not held or decryption failure status are skipped, and the dialog shows how many rows will be included versus how many will be left out.
**Where decryption happens.** The CSV is assembled entirely in the browser from data that has already been decrypted. No plaintext leaves the device during export. The server is not involved beyond having delivered the encrypted response data when the viewer first loaded.
**Audit.** Exporting logs an audit event with the form identifier and the count of exported rows. The event appears in the audit log so the organization has a record of when response data was downloaded.`)
};

const es_demo_narrative_admin_response_export_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Export_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El botón de exportar en la parte superior del visor de respuestas abre un diálogo para descargar las respuestas como un archivo CSV.
**Qué se incluye.** El CSV contiene todas las respuestas que el navegador del voluntario pudo descifrar. Las respuestas con estado de clave no disponible o fallo de descifrado se omiten, y el diálogo muestra cuántas filas se incluirán frente a cuántas se dejarán fuera.
**Dónde ocurre el descifrado.** El CSV se ensambla completamente en el navegador a partir de datos ya descifrados. Ningún texto plano sale del dispositivo durante la exportación. El servidor no participa más allá de haber entregado los datos de respuesta cifrados cuando el visor se cargó inicialmente.
**Auditoría.** Exportar registra un evento de auditoría con el identificador del formulario y el conteo de filas exportadas. El evento aparece en el registro de auditoría para que la organización tenga un registro de cuándo se descargaron datos de respuestas.`)
};

/**
* | output |
* | --- |
* | "The export button at the top of the response viewer opens a dialog for downloading the responses as a CSV file. **What is included.** The CSV contains every ..." |
*
* @param {Demo_Narrative_Admin_Response_Export_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_export_body = /** @type {((inputs?: Demo_Narrative_Admin_Response_Export_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Response_Export_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_response_export_body(inputs)
	return en_demo_narrative_admin_response_export_body(inputs)
});