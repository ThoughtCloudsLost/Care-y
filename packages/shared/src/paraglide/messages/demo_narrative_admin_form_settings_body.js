/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Settings_BodyInputs */

const en_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The settings block at the top of the editor controls the form's identity and behavior.
**Name and slug.** The name is what administrators see in the forms list, and the slug becomes the public URL path for the form. Both are stored as plaintext on the server because they carry no sensitive content.
**Default toggle.** A toggle marks this form as the organization's default. The default form is what visitors see at the base intake URL without a slug, and only one form can be the default at a time.
**Destination queue.** A dropdown selects which queue receives tickets created through this form, and the list shows the organization's decrypted queue names.
**Closing date.** A date time picker sets when the form stops accepting submissions. Leaving it blank means the form stays open indefinitely, and a clear button appears when a date is set.
**Share link.** When the form has been saved, a row shows the public URL with a copy button so administrators can share or embed it.
**Banner image.** An upload button adds a banner image that appears at the top of the form. Once uploaded, the image shows a preview with an alt text field and a remove button, and the banner file itself is encrypted with the organization's public key before upload.`)
};

const es_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El bloque de configuración en la parte superior del editor controla la identidad y el comportamiento del formulario.
**Nombre y slug.** El nombre es lo que los administradores ven en la lista de formularios, y el slug se convierte en la ruta URL pública del formulario. Ambos se almacenan en texto plano en el servidor porque no contienen contenido sensible.
**Alternancia de predeterminado.** Una alternancia marca este formulario como el predeterminado de la organización. El formulario predeterminado es lo que ven los visitantes en la URL base de admisión sin un slug, y solo un formulario puede ser el predeterminado a la vez.
**Cola de destino.** Un desplegable selecciona qué cola recibe los tickets creados a través de este formulario, y la lista muestra los nombres descifrados de las colas de la organización.
**Fecha de cierre.** Un selector de fecha y hora establece cuándo el formulario deja de aceptar envíos. Dejarlo en blanco significa que el formulario permanece abierto indefinidamente, y un botón de limpiar aparece cuando se ha establecido una fecha.
**Enlace para compartir.** Cuando el formulario se ha guardado, una fila muestra la URL pública con un botón de copiar para que los administradores puedan compartirlo o incrustarlo.
**Imagen de banner.** Un botón de subir añade una imagen de banner que aparece en la parte superior del formulario. Una vez subida, la imagen muestra una vista previa con un campo de texto alternativo y un botón de eliminar, y el archivo de banner se cifra con la clave pública de la organización antes de subirlo.`)
};

/**
* | output |
* | --- |
* | "The settings block at the top of the editor controls the form's identity and behavior. **Name and slug.** The name is what administrators see in the forms li..." |
*
* @param {Demo_Narrative_Admin_Form_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_settings_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Settings_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Settings_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_settings_body(inputs)
	return en_demo_narrative_admin_form_settings_body(inputs)
});