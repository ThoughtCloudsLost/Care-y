/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Response_Export_BodyInputs */

const en_demo_narrative_admin_response_export_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Export_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The export button opens a dialog for downloading the current form's responses as a CSV file. The CSV is assembled entirely in the browser from responses that have already been decrypted, and no plaintext leaves the device during the export. Responses that could not be decrypted are skipped rather than exported blank, and the dialog names both the number of rows that will be included and the number that will be left out.
**Security tradeoff.** The dialog warns that the exported file contains personally identifiable information in plaintext. Everything the system does to keep answers encrypted ends at the moment someone exports them, and the export button is disabled while any response is still decrypting so a partial export cannot happen by accident.
**Audit.** An audit event recording the form identifier and the count of exported rows is written before the file is offered. The record is best effort and does not block the download, so the audit log is a record of the export rather than a gate on it.`)
};

const es_demo_narrative_admin_response_export_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Export_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El botón de exportar abre un diálogo para descargar las respuestas del formulario actual como archivo CSV. El CSV se ensambla completamente en el navegador a partir de respuestas que ya fueron descifradas, y ningún texto plano sale del dispositivo durante la exportación. Las respuestas que no pudieron descifrarse se omiten en lugar de exportarse en blanco, y el diálogo indica tanto el número de filas que se incluirán como el número que se dejará fuera.
**Compromiso de seguridad.** El diálogo advierte que el archivo exportado contiene información personal identificable en texto plano. Todo lo que el sistema hace para mantener las respuestas cifradas termina en el momento en que alguien las exporta, y el botón de exportar se deshabilita mientras alguna respuesta aún se está descifrando para que una exportación parcial no pueda ocurrir por accidente.
**Auditoría.** Se registra un evento de auditoría con el identificador del formulario y el conteo de filas exportadas antes de ofrecer el archivo. El registro es de mejor esfuerzo y no bloquea la descarga, de modo que el registro de auditoría es constancia de la exportación, no una condición para ella.`)
};

const en_xa2_demo_narrative_admin_response_export_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Export_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè èxpòrt bùttòn òpèns à dìàlòg fòr dòwnlòàdìng thè cùrrènt fòrm's rèspònsès às à CSV fìlè. Thè CSV ìs àssèmblèd èntìrèly ìn thè bròwsèr fròm rèspònsès thàt hàvè àlrèàdy bèèn dècryptèd, ànd nò plàìntèxt lèàvès thè dèvìcè dùrìng thè èxpòrt. Rèspònsès thàt còùld nòt bè dècryptèd àrè skìppèd ràthèr thàn èxpòrtèd blànk, ànd thè dìàlòg nàmès bòth thè nùmbèr òf ròws thàt wìll bè ìnclùdèd ànd thè nùmbèr thàt wìll bè lèft òùt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sècùrìty tràdèòff. ••••••** Thè dìàlòg wàrns thàt thè èxpòrtèd fìlè còntàìns pèrsònàlly ìdèntìfìàblè ìnfòrmàtìòn ìn plàìntèxt. Èvèrythìng thè systèm dòès tò kèèp ànswèrs èncryptèd ènds àt thè mòmènt sòmèònè èxpòrts thèm, ànd thè èxpòrt bùttòn ìs dìsàblèd whìlè àny rèspònsè ìs stìll dècryptìng sò à pàrtìàl èxpòrt cànnòt hàppèn by àccìdènt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àùdìt. ••** Àn àùdìt èvènt rècòrdìng thè fòrm ìdèntìfìèr ànd thè còùnt òf èxpòrtèd ròws ìs wrìttèn bèfòrè thè fìlè ìs òffèrèd. Thè rècòrd ìs bèst èffòrt ànd dòès nòt blòck thè dòwnlòàd, sò thè àùdìt lòg ìs à rècòrd òf thè èxpòrt ràthèr thàn à gàtè òn ìt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The export button opens a dialog for downloading the current form's responses as a CSV file. The CSV is assembled entirely in the browser from responses that..." |
*
* @param {Demo_Narrative_Admin_Response_Export_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_export_body = /** @type {((inputs?: Demo_Narrative_Admin_Response_Export_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Response_Export_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_response_export_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_response_export_body(inputs)
	return en_demo_narrative_admin_response_export_body(inputs)
});