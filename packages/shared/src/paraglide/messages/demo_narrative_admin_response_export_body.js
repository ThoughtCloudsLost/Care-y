/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Response_Export_BodyInputs */

const en_demo_narrative_admin_response_export_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Export_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exporting builds a CSV from responses the browser has already decrypted and hands it straight to the download, so no plaintext travels and the server contributes nothing to the file but the ciphertext it already sent. The export is offered only when no row is still decrypting, so a partial file cannot be produced by acting early. [[#encryption #client-data]]
**What lands in the file and what does not.** One column for the arrival time, then one per field the form currently defines, in the form's order. Rows the user could not decrypt are left out rather than exported blank, and the dialog names how many are included and how many are skipped. Only the pages loaded into the viewer are in scope: submissions further back are neither exported nor counted among the skipped ones. [Response cards](#admin-responses/responses) covers how pages are loaded. [[#failure-states]]
**Answers with no column.** An answer whose field has since been removed from the form is shown in the viewer and has no column in the file, because the columns come from the current definition. A form edited between submission and export therefore produces a file narrower than what people actually sent. [The form builder](#admin-forms/builder) covers what removing a field does. [[#client-data]]
**What the file is once it exists.** Plaintext personal information in a spreadsheet, which the dialog says before the download starts. Everything the system does to keep answers encrypted covers the path up to this point and not the file afterwards, so where the file goes is a decision made outside CARE-Y. Cells that would otherwise be read as formulas are prefixed so a spreadsheet treats them as text. [The trust boundary](#deep-dive/the-trust-boundary) covers what the encryption does and does not reach. [[#privacy #encryption]]
**The assembler and the audit write.** \`assembleIntakeCsv\` in \`packages/client/src/lib/export/intake-csv.ts\` does the quoting and the formula-prefixing, following RFC 4180 and the OWASP guidance cited in the module. \`logExport\` in \`packages/server/src/routes/intake-forms.ts\` records the form and both counts before the file is offered, and the download proceeds even when that write fails, so the log is a record of the export rather than a gate on it. [Audit log](#admin-logs/audit) covers the log itself. [[#metadata]]`)
};

const es_demo_narrative_admin_response_export_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Export_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exportar construye un CSV a partir de las respuestas que el navegador ya descifró y lo entrega directamente a la descarga, así que ningún texto en claro viaja y el servidor no aporta al archivo más que el texto cifrado que ya envió. La exportación solo se ofrece cuando ninguna fila sigue descifrándose, de modo que actuar pronto no puede producir un archivo parcial. [[#encryption #client-data]]
**Qué acaba en el archivo y qué no.** Una columna para la hora de llegada y luego una por cada campo que el formulario define ahora, en el orden del formulario. Las filas que la persona usuaria no pudo descifrar quedan fuera en lugar de exportarse en blanco, y el diálogo indica cuántas se incluyen y cuántas se omiten. Solo entran las páginas cargadas en el visor: los envíos anteriores ni se exportan ni se cuentan entre los omitidos. [Tarjetas de respuesta](#admin-responses/responses) trata cómo se cargan las páginas. [[#failure-states]]
**Respuestas sin columna.** Una respuesta cuyo campo se eliminó del formulario se muestra en el visor y no tiene columna en el archivo, porque las columnas salen de la definición actual. Un formulario editado entre el envío y la exportación produce por tanto un archivo más estrecho que lo que la gente envió. [El constructor de formularios](#admin-forms/builder) trata qué ocurre al eliminar un campo. [[#client-data]]
**Qué es el archivo una vez existe.** Información personal en texto plano dentro de una hoja de cálculo, que es lo que el diálogo indica antes de que empiece la descarga. Todo lo que el sistema hace para mantener cifradas las respuestas cubre el camino hasta este punto y no el archivo posterior, así que dónde acaba ese archivo es una decisión que se toma fuera de CARE-Y. Las celdas que de otro modo se leerían como fórmulas llevan un prefijo para que la hoja de cálculo las trate como texto. [La frontera de confianza](#deep-dive/the-trust-boundary) trata hasta dónde llega el cifrado y hasta dónde no. [[#privacy #encryption]]
**El ensamblador y la escritura de auditoría.** \`assembleIntakeCsv\`, en \`packages/client/src/lib/export/intake-csv.ts\`, se encarga del entrecomillado y del prefijo de fórmulas, siguiendo la RFC 4180 y la guía de OWASP citada en el módulo. \`logExport\`, en \`packages/server/src/routes/intake-forms.ts\`, registra el formulario y ambos recuentos antes de ofrecer el archivo, y la descarga sigue adelante aunque esa escritura falle, de modo que el registro es constancia de la exportación y no una condición para ella. [Registro de auditoría](#admin-logs/audit) trata el registro en sí. [[#metadata]]`)
};

const en_xa2_demo_narrative_admin_response_export_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Export_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè èxpòrt bùttòn òpèns à dìàlòg fòr dòwnlòàdìng thè cùrrènt fòrm's rèspònsès às à CSV fìlè. Thè CSV ìs àssèmblèd èntìrèly ìn thè bròwsèr fròm rèspònsès thàt hàvè àlrèàdy bèèn dècryptèd, ànd nò plàìntèxt lèàvès thè dèvìcè dùrìng thè èxpòrt. Rèspònsès thàt còùld nòt bè dècryptèd àrè skìppèd ràthèr thàn èxpòrtèd blànk, ànd thè dìàlòg nàmès bòth thè nùmbèr òf ròws thàt wìll bè ìnclùdèd ànd thè nùmbèr thàt wìll bè lèft òùt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sècùrìty tràdèòff. ••••••** Thè dìàlòg wàrns thàt thè èxpòrtèd fìlè còntàìns pèrsònàlly ìdèntìfìàblè ìnfòrmàtìòn ìn plàìntèxt. Èvèrythìng thè systèm dòès tò kèèp ànswèrs èncryptèd ènds àt thè mòmènt sòmèònè èxpòrts thèm, ànd thè èxpòrt bùttòn ìs dìsàblèd whìlè àny rèspònsè ìs stìll dècryptìng sò à pàrtìàl èxpòrt cànnòt hàppèn by àccìdènt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àùdìt. ••** Àn àùdìt èvènt rècòrdìng thè fòrm ìdèntìfìèr ànd thè còùnt òf èxpòrtèd ròws ìs wrìttèn bèfòrè thè fìlè ìs òffèrèd. Thè rècòrd ìs bèst èffòrt ànd dòès nòt blòck thè dòwnlòàd, sò thè àùdìt lòg ìs à rècòrd òf thè èxpòrt ràthèr thàn à gàtè òn ìt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Exporting builds a CSV from responses the browser has already decrypted and hands it straight to the download, so no plaintext travels and the server contrib..." |
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